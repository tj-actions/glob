import * as core from '@actions/core'
import * as path from 'path'
import mockedEnv, {RestoreFn} from 'mocked-env'
import {normalizeSeparators} from '../src/utils'
import {run} from '../src/main'

const defaultEnv = {
  'INPUT_FILES-SEPARATOR': '\n',
  'INPUT_FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_FOLLOW-SYMBOLIC-LINKS': 'true',
  'INPUT_SEPARATOR': ' ',
  'INPUT_STRIP-TOP-LEVEL-DIR': 'true'
}

const {GITHUB_WORKSPACE} = process.env

let restore: RestoreFn

afterEach(() => {
  if (restore) {
    restore()
  }
})

test('returns the paths of the filtered files (input files, input source files)', async () => {
  restore = mockedEnv({
    ...defaultEnv,
    'INPUT_FILES': '__test__/**/*.test.js\n*.sh',
    'INPUT_FILES-FROM-SOURCE-FILE':
      '__test__/source-files.txt\n__test__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/rebase.yml',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md',
    '__test__/getDeletedFiles.test.js',
    '__test__/getFilesFromSourceFile.test.js',
    '__test__/main.test.js',
    '__test__/util.test.js'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenCalledWith('paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input files)', async () => {
  restore = mockedEnv({
    ...defaultEnv,
    'INPUT_INCLUDE-DELETED-FILES': 'true',
    'INPUT_FILES': '__test__/**/*.test.js\n__test__/**.txt\n*.sh',
    'INPUT_BASE-SHA': '99561ef',
    'INPUT_SHA': '2eb2427'
  })

  const EXPECTED_FILENAMES = [
    '__test__/getDeletedFiles.test.js',
    '__test__/getFilesFromSourceFile.test.js',
    '__test__/main.test.js',
    '__test__/source-files.txt',
    '__test__/util.test.js',
    'entrypoint.sh'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenCalledWith('paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input source files)', async () => {
  restore = mockedEnv({
    ...defaultEnv,
    'INPUT_FILES-FROM-SOURCE-FILE':
      '__test__/source-files.txt\n__test__/source-files.txt\n__test__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/rebase.yml',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md'
  ]
    .map(fName => normalizeSeparators(path.join(GITHUB_WORKSPACE!, fName)))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenCalledWith('paths', EXPECTED_FILENAMES)
})
