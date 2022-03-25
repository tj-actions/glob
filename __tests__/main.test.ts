import * as core from '@actions/core'
import * as path from 'path'
import {promises as fs} from 'fs'

import {normalizeSeparators, tempfile} from '../src/utils'
import {run} from '../src/main'

const defaultEnv = {
  'INPUT_FILES-SEPARATOR': '\n',
  'INPUT_FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_FOLLOW-SYMBOLIC-LINKS': 'true',
  INPUT_SEPARATOR: ' ',
  'INPUT_STRIP-TOP-LEVEL-DIR': 'true',
  'INPUT_WORKING-DIRECTORY': process.cwd(),
  'INPUT_INCLUDE-DELETED-FILES': 'false',
  INPUT_FILES: '',
  'INPUT_FILES-FROM-SOURCE-FILE': ''
}

const {GITHUB_WORKSPACE} = process.env

function mockedEnv(testEnvVars: {[key: string]: string}) {
  for (const key in testEnvVars) {
    process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
  }
}

test('returns the paths of the filtered files (input files, input source files)', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: '__tests__/**/*.test.ts\n*.sh',
    'INPUT_FILES-FROM-SOURCE-FILE':
      '__tests__/source-files.txt\n__tests__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/greetings.yml',
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md',
    '__tests__/cleanup.test.ts',
    '__tests__/getDeletedFiles.test.ts',
    '__tests__/getFilesFromSourceFile.test.ts',
    '__tests__/main.test.ts',
    '__tests__/util.test.ts'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input files)', async () => {
  mockedEnv({
    ...defaultEnv,
    'INPUT_INCLUDE-DELETED-FILES': 'true',
    INPUT_FILES: '__tests__/*.test.ts\n__tests__/**.txt\n*.sh',
    'INPUT_BASE-SHA': '99561ef',
    INPUT_SHA: '2eb2427'
  })

  const EXPECTED_FILENAMES = [
    '__tests__/cleanup.test.ts',
    '__tests__/getDeletedFiles.test.ts',
    '__tests__/getFilesFromSourceFile.test.ts',
    '__tests__/main.test.ts',
    '__tests__/source-files.txt',
    '__tests__/util.test.ts',
    'entrypoint.sh'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input source files)', async () => {
  mockedEnv({
    ...defaultEnv,
    'INPUT_FILES-FROM-SOURCE-FILE':
      '__tests__/source-files.txt\n__tests__/source-files.txt\n__tests__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/greetings.yml',
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files in the paths-output-file', async () => {
  mockedEnv({
    ...defaultEnv,
    'INPUT_FILES-FROM-SOURCE-FILE':
      '__tests__/source-files.txt\n__tests__/source-files.txt\n__tests__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/greetings.yml',
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  const pathsOutputFile = tempfile('.txt')

  // @ts-ignore
  tempfile = jest.fn().mockReturnValue(pathsOutputFile)

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(
    2,
    'paths-output-file',
    pathsOutputFile
  )
})

test('returns warning for no match found', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: '-**.yml'
  })

  // @ts-ignore
  core.warning = jest.fn()

  await run()

  expect(core.warning).toBeCalledWith(
    'No match found for specified patterns. Ensure that subdirectory patterns a prefixed with "**/". See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet'
  )
})
