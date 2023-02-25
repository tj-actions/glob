import * as core from '@actions/core'
import {run} from '../main'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {normalizeSeparators, tempfile} from '../utils'

const defaultEnv = {
  'INPUT_FILES-SEPARATOR': '\n',
  'INPUT_FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-SEPARATOR': '\n',
  'INPUT_EXCLUDED-FILES-FROM-SOURCE-FILE-SEPARATOR': '\n',
  'INPUT_FOLLOW-SYMBOLIC-LINKS': 'true',
  'INPUT_MATCH-DIRECTORIES': 'true',
  'INPUT_MATCH-GITIGNORE-FILES': 'true',
  'INPUT_ESCAPE-PATHS': 'false',
  'INPUT_HEAD-REPO-FORK': 'false',
  INPUT_SEPARATOR: ' ',
  'INPUT_STRIP-TOP-LEVEL-DIR': 'true',
  'INPUT_WORKING-DIRECTORY': '.',
  'INPUT_INCLUDE-DELETED-FILES': 'false',
  INPUT_FILES: '',
  'INPUT_FILES-FROM-SOURCE-FILE': ''
}

function mockedEnv(testEnvVars: {[key: string]: string}): void {
  for (const key in testEnvVars) {
    process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
  }
}

test('returns the paths of the filtered files (input files, input source files)', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'src/__tests__/**.test.ts\n*.sh',
    'INPUT_FILES-FROM-SOURCE-FILE':
      'src/__tests__/source-files.txt\nsrc/__tests__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/greetings.yml',
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md',
    'src/__tests__/cleanup.test.ts',
    'src/__tests__/getDeletedFiles.test.ts',
    'src/__tests__/getFilesFromSourceFile.test.ts',
    'src/__tests__/main.test.ts',
    'src/__tests__/util.test.ts'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input files, input source files) with match-directories enabled', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'src'
  })

  const EXPECTED_FILENAMES = [
    'src',
    'src/__tests__',
    'src/__tests__/cleanup.test.ts',
    'src/__tests__/getDeletedFiles.test.ts',
    'src/__tests__/getFilesFromSourceFile.test.ts',
    'src/__tests__/main.test.ts',
    'src/__tests__/source-files.txt',
    'src/__tests__/test.txt',
    'src/__tests__/util.test.ts',
    'src/cleanup.ts',
    'src/main.ts',
    'src/utils.ts'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input files, input source files) with match-directories disabled', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'src',
    'INPUT_MATCH-DIRECTORIES': 'false'
  })

  const EXPECTED_FILENAMES = [
    'src/__tests__/cleanup.test.ts',
    'src/__tests__/getDeletedFiles.test.ts',
    'src/__tests__/getFilesFromSourceFile.test.ts',
    'src/__tests__/main.test.ts',
    'src/__tests__/source-files.txt',
    'src/__tests__/test.txt',
    'src/__tests__/util.test.ts',
    'src/cleanup.ts',
    'src/main.ts',
    'src/utils.ts'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the all other files (input files)', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: '!src/__tests__\n!*.md\n!dist\n!jest\n!.*\n!src/main.ts\n!lib'
  })

  const EXPECTED_FILENAMES = [
    'LICENSE',
    'action.yml',
    'jest.config.js',
    'package.json',
    'renovate.json',
    'src',
    'src/cleanup.ts',
    'src/utils.ts',
    'tsconfig.json',
    'yarn.lock'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input files)', async () => {
  mockedEnv({
    ...defaultEnv,
    'INPUT_INCLUDE-DELETED-FILES': 'true',
    INPUT_FILES: 'src/__tests__/*.test.ts\nsrc/__tests__/**.txt\n*.sh',
    'INPUT_BASE-REF': 'main',
    'INPUT_BASE-SHA': '99561ef',
    INPUT_SHA: '2eb2427'
  })

  const EXPECTED_FILENAMES = [
    'src/__tests__/cleanup.test.ts',
    'src/__tests__/getDeletedFiles.test.ts',
    'src/__tests__/getFilesFromSourceFile.test.ts',
    'src/__tests__/main.test.ts',
    'src/__tests__/source-files.txt',
    'src/__tests__/test.txt',
    'src/__tests__/util.test.ts',
    'entrypoint.sh'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('returns the paths of the filtered files (input source files)', async () => {
  mockedEnv({
    ...defaultEnv,
    'INPUT_FILES-FROM-SOURCE-FILE':
      'src/__tests__/source-files.txt\nsrc/__tests__/source-files.txt\nsrc/__tests__/source-files.txt'
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

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('returns true when no custom patterns are used', async () => {
  mockedEnv(defaultEnv)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(
    3,
    'has-custom-patterns',
    false
  )
})

test('returns the paths of the filtered files in the paths-output-file', async () => {
  mockedEnv({
    ...defaultEnv,
    'INPUT_FILES-FROM-SOURCE-FILE':
      'src/__tests__/source-files.txt\nsrc/__tests__/source-files.txt\nsrc/__tests__/source-files.txt'
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

  const {tempfile: defaultTempfile} = await import('../utils')

  const pathsOutputFile = await defaultTempfile('.txt')

  // @ts-ignore
  tempfile = jest.fn().mockResolvedValue(pathsOutputFile)

  await run()

  // @ts-ignore
  tempfile = defaultTempfile

  expect(core.setOutput).toHaveBeenNthCalledWith(
    1,
    'paths-output-file',
    pathsOutputFile
  )
  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
  expect(core.setOutput).toHaveBeenNthCalledWith(3, 'has-custom-patterns', true)
})

test('exits when the paths-output-file cannot be created', async () => {
  mockedEnv(defaultEnv)

  // @ts-ignore
  core.setOutput = jest.fn()

  const expectedError = new Error('Cannot create file')

  const {tempfile: defaultTempfile} = await import('../utils')

  // @ts-ignore
  tempfile = jest.fn().mockRejectedValue(expectedError)

  await expect(run()).rejects.toThrow(expectedError)

  // @ts-ignore
  tempfile = defaultTempfile
})

test('excludes default excluded files', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: '**/node_modules/**\n.git/**',
    'INPUT_FILES-FROM-SOURCE-FILE': 'src/__tests__/source-files.txt'
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

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('includes patterns provided in the files input that are excluded in the .gitignore file', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'coverage/clover.xml',
    'INPUT_FILES-FROM-SOURCE-FILE': 'src/__tests__/source-files.txt'
  })

  const EXPECTED_FILENAMES = [
    '.github/workflows/greetings.yml',
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
    'HISTORY.md',
    'README.md',
    'coverage/clover.xml'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('includes patterns provided in the files input that are included in the .gitignore file', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'src/__tests__/test.txt'
  })

  const EXPECTED_FILENAMES = ['src/__tests__/test.txt']
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('excludes patterns provided in the files input that are excluded in the .gitignore file when match-gitignore-files is false', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'coverage/clover.xml',
    'INPUT_FILES-FROM-SOURCE-FILE': 'src/__tests__/source-files.txt',
    'INPUT_MATCH-GITIGNORE-FILES': 'false'
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

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('matched file patterns with braces are expanded', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'src/__tests__/*.{txt,ts}'
  })

  const EXPECTED_FILENAMES = [
    'src/__tests__/cleanup.test.ts',
    'src/__tests__/getDeletedFiles.test.ts',
    'src/__tests__/getFilesFromSourceFile.test.ts',
    'src/__tests__/main.test.ts',
    'src/__tests__/source-files.txt',
    'src/__tests__/test.txt',
    'src/__tests__/util.test.ts'
  ]
    .map(fName => normalizeSeparators(fName))
    .join(process.env.INPUT_SEPARATOR)

  // @ts-ignore
  core.setOutput = jest.fn()

  await run()

  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'paths', EXPECTED_FILENAMES)
})

test('error raised when files are not found', async () => {
  mockedEnv({
    ...defaultEnv,
    INPUT_FILES: 'src/__tests__/not-found.txt'
  })

  const expectedError = new Error('No paths found using the specified patterns')
  await expect(run()).rejects.toThrow(expectedError)
})
