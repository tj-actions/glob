/* eslint-disable sort-imports */
import * as path from 'path'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {promises as fs} from 'fs'

import {
  getDeletedFiles,
  getFilesFromSourceFile,
  normalizeSeparators,
  tempfile
} from './utils'

const DEFAULT_EXCLUDED_FILES = [
  '!node_modules/**',
  '!**/node_modules/**',
  '!.git/**'
]

export async function run(): Promise<void> {
  const topLevelDir = `${process.env.GITHUB_WORKSPACE}${path.sep}`

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
  const separator = core.getInput('separator', {
    required: true,
    trimWhitespace: false
  })
  const stripTopLevelDir = core.getBooleanInput('strip-top-level-dir', {
    required: true
  })
  const includeDeletedFiles = core.getBooleanInput('include-deleted-files', {
    required: true
  })

  const sha = core.getInput('sha', {required: includeDeletedFiles})
  const baseSha = core.getInput('base-sha', {required: includeDeletedFiles})

  const workingDirectory = core.getInput('working-directory', {
    required: false
  })

  let filePatterns = files.split(filesSeparator).join('\n')

  core.debug(`file patterns: ${filePatterns}`)

  if (excludedFiles !== '') {
    const excludedFilePatterns = excludedFiles
      .split(excludedFilesSeparator)
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
      .map(p => path.join(topLevelDir, p))

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
      .map(p => path.join(topLevelDir, p))

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

  const globOptions = {followSymbolicLinks}
  const globber = await glob.create(filePatterns, globOptions)
  let paths = await globber.glob()

  if (includeDeletedFiles) {
    paths = paths.concat(
      await getDeletedFiles({
        filePatterns,
        baseSha,
        sha,
        cwd: workingDirectory
      })
    )
  }

  if (stripTopLevelDir) {
    paths = paths
      .map((p: string) => normalizeSeparators(p.replace(topLevelDir, '')))
      .filter((p: string) => p !== '')
  }

  const pathsOutput = paths.join(separator)
  core.setOutput('paths', pathsOutput)

  if (pathsOutput) {
    const pathsOutputFile = tempfile('.txt')

    await fs.writeFile(pathsOutputFile, pathsOutput)
    core.setOutput('paths-output-file', pathsOutputFile)
    core.saveState('paths-output-file', pathsOutputFile)
    core.info(`Successfully created paths-output-file: ${pathsOutputFile}`)
  } else {
    const allPatterns = filePatterns.split('\n').filter(p => !DEFAULT_EXCLUDED_FILES.includes(p))
    
    if (allPatterns.length > 0) {
      core.info(allPatterns)
      core.warning(
        'No match found for specified patterns. Ensure that subdirectory patterns a prefixed with "**/". See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet'
      )
    }
  }
}

if (!process.env.TESTING) {
  // eslint-disable-next-line github/no-then
  run().catch(e => {
    core.setFailed(e.message || e)
  })
}
