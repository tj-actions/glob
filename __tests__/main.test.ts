import * as core from '@actions/core'
import * as path from 'path'
import mockedEnv, {RestoreFn} from 'mocked-env'
import {normalizeSeparators} from '../src/utils'
import {run} from '../src/main'

const defaultEnv = {
  INPUT_FILES_SEPARATOR: '\n',
  INPUT_FILES_FROM_SOURCE_FILE_SEPARATOR: '\n',
  INPUT_EXCLUDED_FILES_SEPARATOR: '\n',
  INPUT_EXCLUDED_FILES_FROM_SOURCE_FILE_SEPARATOR: '\n',
  INPUT_FOLLOW_SYMBOLIC_LINKS: 'true',
  INPUT_SEPARATOR: ' ',
  INPUT_STRIP_TOP_LEVEL_DIR: 'true'
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
    INPUT_FILES: '__test__/**/*.test.js\n*.sh',
    INPUT_FILES_FROM_SOURCE_FILE:
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
    INPUT_INCLUDE_DELETED_FILES: 'true',
    INPUT_FILES: '__test__/**/*.test.js\n__test__/**.txt\n*.sh',
    INPUT_BASE_SHA: 'ff61b233',
    INPUT_SHA: '9fde8568'
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
    INPUT_FILES_FROM_SOURCE_FILE:
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
