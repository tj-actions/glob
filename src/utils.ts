/*global AsyncIterableIterator*/
import {createReadStream, promises as fs} from 'fs'
import {tmpdir} from 'os'
import path from 'path'
import {createInterface} from 'readline'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as patternHelper from '@actions/glob/lib/internal-pattern-helper'
import {Pattern} from '@actions/glob/lib/internal-pattern'
import {v4 as uuidv4} from 'uuid'

export const IS_WINDOWS: boolean = process.platform === 'win32'

/**
 * Converts windows path `\` to `/`
 */
export function normalizeSeparators(filePath: string): string {
  filePath = filePath || ''

  // Windows
  if (IS_WINDOWS) {
    // Convert slashes on Windows
    filePath = filePath.replace(/\\/g, '/')
  }

  return filePath
}

/**
 * Retrieve all deleted files
 */
export async function deletedGitFiles({
  baseSha,
  sha,
  cwd,
  diff
}: {
  baseSha: string
  sha: string
  cwd: string
  diff: string
}): Promise<string[]> {
  const {
    exitCode: topDirExitCode,
    stdout: topDirStdout,
    stderr: topDirStderr
  } = await exec.getExecOutput('git', ['rev-parse', '--show-toplevel'], {
    cwd
  })

  if (topDirStderr || topDirExitCode !== 0) {
    throw new Error(topDirStderr || 'An unexpected error occurred')
  }

  const topLevelDir = topDirStdout.trim()

  core.debug(`top level directory: ${topLevelDir}`)

  const {exitCode, stdout, stderr} = await exec.getExecOutput(
    'git',
    ['diff', '--diff-filter=D', '--name-only', `${baseSha}${diff}${sha}`],
    {cwd}
  )

  core.debug(`git diff exited with: ${exitCode}`)

  if (stderr || exitCode !== 0) {
    throw new Error(stderr || 'An unexpected error occurred')
  }

  const deletedFiles = stdout
    .split('\n')
    .map(p => p.trim())
    .filter(p => p !== '')
    .map(p => path.join(topLevelDir, p))

  core.debug(`deleted files: ${deletedFiles}`)

  return deletedFiles
}

async function getPatterns(filePatterns: string): Promise<Pattern[]> {
  const patterns = []

  if (IS_WINDOWS) {
    filePatterns = filePatterns.replace(/\r\n/g, '\n')
    filePatterns = filePatterns.replace(/\r/g, '\n')
  }

  const lines = filePatterns.split('\n').map(filePattern => filePattern.trim())

  for (let line of lines) {
    // Empty or comment
    if (!(!line || line.startsWith('#'))) {
      line = IS_WINDOWS ? line.replace(/\\/g, '/') : line
      const pattern = new Pattern(line)
      // @ts-ignore
      pattern.minimatch.options.nobrace = false
      // @ts-ignore
      pattern.minimatch.make()
      patterns.push(pattern)

      if (
        pattern.trailingSeparator ||
        pattern.segments[pattern.segments.length - 1] !== '**'
      ) {
        patterns.push(
          new Pattern(pattern.negate, true, pattern.segments.concat('**'))
        )
      }
    }
  }

  return patterns
}

export async function getDeletedFiles({
  filePatterns,
  baseSha,
  sha,
  cwd,
  diff
}: {
  filePatterns: string
  baseSha: string
  sha: string
  cwd: string
  diff: string
}): Promise<string[]> {
  const patterns = await getPatterns(filePatterns)
  const deletedFiles = []

  for (const filePath of await deletedGitFiles({baseSha, sha, cwd, diff})) {
    const match = patternHelper.match(patterns, filePath)

    if (match) {
      deletedFiles.push(filePath)
    }
  }

  return deletedFiles
}

/**
 * Generator for retrieving all file contents
 */
async function* lineOfFileGenerator({
  filePath,
  excludedFiles
}: {
  filePath: string
  excludedFiles: boolean
}): AsyncIterableIterator<string> {
  const fileStream = createReadStream(filePath)
  fileStream.on('error', error => {
    throw error
  })
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })
  for await (const line of rl) {
    if (!line.startsWith('#') && line !== '') {
      if (excludedFiles) {
        if (line.startsWith('!')) {
          yield line
        } else {
          yield `!${line}`
        }
      } else {
        yield line
      }
    }
  }
}

export async function getFilesFromSourceFile({
  filePaths,
  excludedFiles = false
}: {
  filePaths: string[]
  excludedFiles?: boolean
}): Promise<string[]> {
  const lines = []
  for (const filePath of filePaths) {
    for await (const line of lineOfFileGenerator({filePath, excludedFiles})) {
      lines.push(line)
    }
  }
  return lines
}

export async function tempfile(extension = ''): Promise<string> {
  const tempDirectory = await fs.realpath(tmpdir())
  return path.join(tempDirectory, `${uuidv4()}${extension}`)
}

export function escapeString(value: string): string {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}
