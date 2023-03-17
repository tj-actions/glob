import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {GlobOptions} from '@actions/glob'
import {existsSync, promises as fs} from 'fs'
import * as path from 'path'

import {
  escapeString,
  getDeletedFiles,
  getFilesFromSourceFile,
  normalizeSeparators,
  tempfile
} from './utils'

const DEFAULT_EXCLUDED_FILES = [
  '!.git/**',
  '!**/node_modules/**',
  '!node_modules/**'
]

export async function run(): Promise<void> {
  const files = core.getInput('files', {required: false})
  const filesSeparator = core.getInput('files-separator', {
    required: false,
    trimWhitespace: false
  })
  const excludedFiles = core.getInput('excluded-files', {required: false})
  const excludedFilesSeparator = core.getInput('excluded-files-separator', {
    required: false,
    trimWhitespace: false
  })

  const filesFromSourceFile = core.getInput('files-from-source-file', {
    required: false
  })
  const filesFromSourceFileSeparator = core.getInput(
    'files-from-source-file-separator',
    {required: false, trimWhitespace: false}
  )
  const excludedFilesFromSourceFile = core.getInput(
    'excluded-files-from-source-file',
    {required: false}
  )
  const excludedFilesFromSourceFileSeparator = core.getInput(
    'excluded-files-from-source-file-separator',
    {required: false, trimWhitespace: false}
  )

  const followSymbolicLinks = core.getBooleanInput('follow-symbolic-links', {
    required: false
  })
  const matchDirectories = core.getBooleanInput('match-directories', {
    required: false
  })
  const matchGitignoreFiles = core.getBooleanInput('match-gitignore-files', {
    required: true
  })
  const separator = core.getInput('separator', {
    required: true,
    trimWhitespace: false
  })
  const diff = core.getInput('diff', {required: false})
  const escapePaths = core.getBooleanInput('escape-paths', {required: false})
  const stripTopLevelDir = core.getBooleanInput('strip-top-level-dir', {
    required: true
  })
  const includeDeletedFiles = core.getBooleanInput('include-deleted-files', {
    required: true
  })
  const baseRef = core.getInput('base-ref', {required: false})
  const headRepoFork =
    core.getInput('head-repo-fork', {required: false}) === 'true'
  const sha = core.getInput('sha', {required: includeDeletedFiles})
  const baseSha = core.getInput('base-sha', {required: includeDeletedFiles})

  const workingDirectory = path.resolve(
    process.env.GITHUB_WORKSPACE || process.cwd(),
    core.getInput('working-directory', {required: true})
  )

  const gitignorePath = path.join(workingDirectory, '.gitignore')

  let filePatterns = files
    .split(filesSeparator)
    .filter(p => p !== '')
    .join('\n')

  core.debug(`file patterns: ${filePatterns}`)

  let diffType = diff

  if (!diffType) {
    diffType = !baseRef || headRepoFork ? '..' : '...'
  }

  if (excludedFiles !== '') {
    const excludedFilePatterns = excludedFiles
      .split(excludedFilesSeparator)
      .filter(p => p !== '')
      .map(p => {
        if (!p.startsWith('!')) {
          p = `!${p}`
        }
        return p
      })
      .join('\n')

    core.debug(`excluded file patterns: ${excludedFilePatterns}`)

    if (!files) {
      filePatterns += `\n**\n${excludedFilePatterns}`
    } else {
      filePatterns += `\n${excludedFilePatterns}`
    }
  }

  if (filesFromSourceFile !== '') {
    const inputFilesFromSourceFile = filesFromSourceFile
      .split(filesFromSourceFileSeparator)
      .filter(p => p !== '')
      .map(p => path.join(workingDirectory, p))

    const filesFromSourceFiles = (
      await getFilesFromSourceFile({filePaths: inputFilesFromSourceFile})
    ).join('\n')

    core.debug(`files from source files patterns: ${filesFromSourceFiles}`)

    filePatterns += `\n${filesFromSourceFiles}`
  }

  if (excludedFilesFromSourceFile !== '') {
    const inputExcludedFilesFromSourceFile = excludedFilesFromSourceFile
      .split(excludedFilesFromSourceFileSeparator)
      .filter(p => p !== '')
      .map(p => path.join(workingDirectory, p))

    const excludedFilesFromSourceFiles = (
      await getFilesFromSourceFile({
        filePaths: inputExcludedFilesFromSourceFile,
        excludedFiles: true
      })
    ).join('\n')

    core.debug(
      `excluded files from source files patterns: ${excludedFilesFromSourceFiles}`
    )

    if (!files && !filesFromSourceFile) {
      filePatterns += `\n**\n${excludedFilesFromSourceFiles}`
    } else {
      filePatterns += `\n${excludedFilesFromSourceFiles}`
    }
  }

  filePatterns += `\n${DEFAULT_EXCLUDED_FILES.join('\n')}`

  filePatterns = [...new Set(filePatterns.split('\n').filter(p => p !== ''))]
    .map(pt => {
      const parts = pt.split(path.sep)
      let absolutePath: string
      let isExcluded = false

      if (parts[0].startsWith('!')) {
        absolutePath = path.resolve(
          path.join(workingDirectory, parts[0].slice(1))
        )
        isExcluded = true
      } else {
        absolutePath = path.resolve(path.join(workingDirectory, parts[0]))
      }

      const p = path.join(absolutePath, ...parts.slice(1))

      return isExcluded ? `!${p}` : p
    })
    .join('\n')

  let allInclusive = false

  if (filePatterns.split('\n').filter(p => !p.startsWith('!')).length === 0) {
    allInclusive = true
    filePatterns = `**\n${filePatterns}`
  }

  core.debug(`file patterns: ${filePatterns}`)

  const globOptions: GlobOptions = {
    followSymbolicLinks,
    matchDirectories
  }

  const globber = await glob.create(filePatterns, globOptions)
  // @ts-ignore
  globber.patterns.map(pattern => {
    pattern.minimatch.options.nobrace = false
    pattern.minimatch.make()
    return pattern
  })
  let paths = await globber.glob()

  if (existsSync(gitignorePath)) {
    const gitignoreFilePatterns = (
      await getFilesFromSourceFile({
        filePaths: [gitignorePath]
      })
    )
      .concat(DEFAULT_EXCLUDED_FILES)
      .filter(p => !!p)
      .map(pt => {
        const negated = pt.startsWith('!')
        const parts = pt.replace(/^!/, '').split(path.sep)

        const absolutePath = path.resolve(path.join(workingDirectory, parts[0]))

        return `${negated ? '!' : ''}${path.join(
          absolutePath,
          ...parts.slice(1)
        )}`
      })
      .join('\n')

    core.debug(`gitignore file patterns: ${gitignoreFilePatterns}`)

    const gitIgnoreGlobber = await glob.create(
      gitignoreFilePatterns,
      globOptions
    )

    const gitignoreMatchingFiles = await gitIgnoreGlobber.glob()

    if (allInclusive || !matchGitignoreFiles) {
      paths = paths.filter(p => !gitignoreMatchingFiles.includes(p))
    } else if (matchGitignoreFiles) {
      paths = paths.filter(
        p =>
          !gitignoreMatchingFiles.filter(gp => !paths.includes(gp)).includes(p)
      )
    }
  }

  if (includeDeletedFiles) {
    paths = paths.concat(
      await getDeletedFiles({
        filePatterns,
        baseSha,
        sha,
        cwd: workingDirectory,
        diff: diffType
      })
    )
  }

  if (stripTopLevelDir) {
    paths = paths
      .map((p: string) =>
        normalizeSeparators(p.replace(workingDirectory + path.sep, ''))
      )
      .map((p: string) => normalizeSeparators(p.replace(workingDirectory, '')))
      .filter((p: string) => p !== '')
  }

  if (escapePaths) {
    paths = paths.map((p: string) => escapeString(p))
  }

  const pathsOutput = paths.join(separator)

  const hasCustomPatterns =
    files !== '' ||
    filesFromSourceFile !== '' ||
    excludedFiles !== '' ||
    excludedFilesFromSourceFile !== ''

  if (pathsOutput) {
    const pathsOutputFile = await tempfile('.txt')
    await fs.writeFile(pathsOutputFile, pathsOutput, {flag: 'w'})

    core.setOutput('paths-output-file', pathsOutputFile)
    core.saveState('paths-output-file', pathsOutputFile)
    core.info(`Successfully created paths-output-file: ${pathsOutputFile}`)
  } else if (hasCustomPatterns) {
    throw new Error('No paths found using the specified patterns')
  }

  core.setOutput('paths', pathsOutput)
  core.setOutput('has-custom-patterns', hasCustomPatterns)
}

if (!process.env.TESTING) {
  // eslint-disable-next-line github/no-then
  run().catch(e => {
    core.setFailed(e.message || e)
  })
}
