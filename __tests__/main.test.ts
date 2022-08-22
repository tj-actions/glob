import * as core from "@actions/core";
import { run } from "../src/main";

import { normalizeSeparators, tempfile } from "../src/utils";

const defaultEnv = {
  'INPUT_FILES-SEPARATOR': '\n',
  'INPUT_FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_FOLLOW-SYMBOLIC-LINKS': 'true',
  'INPUT_ESCAPE-PATHS': 'false',
  INPUT_SEPARATOR: ' ',
  'INPUT_STRIP-TOP-LEVEL-DIR': 'true',
  'INPUT_WORKING-DIRECTORY': '.',
  'INPUT_INCLUDE-DELETED-FILES': 'false',
  INPUT_FILES: '',
  'INPUT_FILES-FROM-SOURCE-FILE': ''
}

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
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the all other files (input files)', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: '!__tests__\n!*.md\n!dist\n!jest\n!.*\n!src\n!lib',
  })

  const EXPECTED_FILENAMES = [
    'LICENSE',
    'action.yml',
    'jest.config.js',
    'package.json',
    'renovate.json',
    'tsconfig.json',
    'yarn.lock'
  ]
    .map(fName => normalizeSeparators(fName))
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
    .map(fName => normalizeSeparators(fName))
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
    .map(fName => normalizeSeparators(fName))
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
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  const pathsOutputFile = tempfile('.txt')

  // @ts-ignore
  tempfile = jest.fn().mockReturnValue(pathsOutputFile)

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'paths', EXPECTED_FILENAMES)

  expect(core.setOutput).toHaveBeenNthCalledWith(
    2,
    'paths-output-file',
    pathsOutputFile
  )
})
