/* eslint-disable sort-imports */
import * as path from 'path'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {
  getDeletedFiles,
  getFilesFromSourceFile,
  normalizeSeparators
} from './utils'

const DEFAULT_EXCLUDED_FILES = [
    '!node_modules/**',
    '!**/node_modules/**',
    '!.git/**'
]

export async function run(): Promise<void> {
  const topLevelDir = `${process.env.GITHUB_WORKSPACE}${path.sep}`

  const files = core.getInput('files', {required: false})
  const filesSeparator = core.getInput('files-separator', {required: false, trimWhitespace: false})
  const excludedFiles = core.getInput('excluded-files', {required: false})
  const excludedFilesSeparator = core.getInput('excluded-files-separator', {
    required: false, trimWhitespace: false
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
  const separator = core.getInput('separator', {required: true, trimWhitespace: false})
  const stripTopLevelDir = core.getBooleanInput('strip-top-level-dir', {
    required: true
  })
  const includeDeletedFiles = core.getBooleanInput('include-deleted-files', {
    required: true
  })

  const sha = core.getInput('sha', {required: includeDeletedFiles})
  const baseSha = core.getInput('base-sha', {required: includeDeletedFiles})

  const workingDirectory = core.getInput('working-directory', {
    required: true
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

    filePatterns += `\n${excludedFilePatterns}`
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

    filePatterns += `\n${excludedFilesFromSourceFiles}`
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

  core.setOutput('paths', paths.join(separator))
}


if (!process.env.TESTING) {
// eslint-disable-next-line github/no-then
  run().catch(e => {
    core.setFailed(e.message || e)
  })
}
