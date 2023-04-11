import * as path from 'path'
import {getDeletedFiles, normalizeSeparators} from '../utils'

const {GITHUB_WORKSPACE} = process.env
const topLevelDir = `${GITHUB_WORKSPACE}${path.sep}`

describe('utils test', () => {
  describe('normalizeSeparators when running on Windows', () => {
    const FILENAMES = path
      .resolve(__dirname, 'source-files.txt')
      .replace(/\//g, '\\')
    const platform = process.platform

    beforeAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: 'win32'
      })
    })

    afterAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: platform
      })
    })

    it('normalizeSeparators returns all fileNames with the correct separator on Windows', async () => {
      const fileNames = normalizeSeparators(FILENAMES)

      expect(fileNames).toContain('/')
      expect(fileNames).toEqual(expect.not.stringContaining('\\'))
    })
  })

  describe('normalizeSeparators when running on Linux', () => {
    const FILENAMES = path.resolve(__dirname, 'source-files.txt')
    const platform = process.platform

    beforeAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: 'linux'
      })
    })

    afterAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: platform
      })
    })

    it('normalizeSeparators returns all fileNames with the correct separator on Linux', async () => {
      const fileNames = normalizeSeparators(FILENAMES)

      expect(fileNames).toContain('/')
      expect(fileNames).toEqual(expect.not.stringContaining('\\'))
    })
  })

  describe('normalizeSeparators when running on macOS', () => {
    const FILENAMES = path.resolve(__dirname, 'source-files.txt')
    const platform = process.platform

    beforeAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: 'darwin'
      })
    })

    afterAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: platform
      })
    })

    it('normalizeSeparators returns all fileNames with the correct separator on macOS', async () => {
      const fileNames = normalizeSeparators(FILENAMES)

      expect(fileNames).toContain('/')
      expect(fileNames).toEqual(expect.not.stringContaining('\\'))
    })
  })

  describe('getDeletedFiles when running on Windows', () => {
    const filePatterns = [
      '*.md',
      '**.yaml',
      '**/rebase.yml',
      '!**.yml',
      '*.sh'
    ].join('\r\n')
    const platform = process.platform

    beforeAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: 'win32'
      })
    })

    afterAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: platform
      })
    })

    it('returns all deleted fileNames', async () => {
      const deletedFiles = await getDeletedFiles({
        filePatterns,
        baseSha: '99561ef',
        sha: '2eb2427',
        cwd: GITHUB_WORKSPACE ? GITHUB_WORKSPACE : process.cwd(),
        diff: '...'
      })

      expect(deletedFiles).toContain(path.join(topLevelDir, 'entrypoint.sh'))
    })
  })

  describe('getDeletedFiles when running on Linux', () => {
    const filePatterns = [
      '*.md',
      '**.yaml',
      '**/rebase.yml',
      '!**.yml',
      '*.sh'
    ].join('\n')
    const platform = process.platform

    beforeAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: 'linux'
      })
    })

    afterAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: platform
      })
    })

    it('returns all deleted fileNames', async () => {
      const deletedFiles = await getDeletedFiles({
        filePatterns,
        baseSha: '99561ef',
        sha: '2eb2427',
        cwd: GITHUB_WORKSPACE ? GITHUB_WORKSPACE : process.cwd(),
        diff: '...'
      })

      expect(deletedFiles).toContain(path.join(topLevelDir, 'entrypoint.sh'))
    })
  })

  describe('getDeletedFiles when running on macOS', () => {
    const filePatterns = [
      '*.md',
      '**.yaml',
      '**/rebase.yml',
      '!**.yml',
      '*.sh'
    ].join('\n')
    const platform = process.platform

    beforeAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: 'darwin'
      })
    })

    afterAll(() => {
      Object.defineProperty(global.process, 'platform', {
        value: platform
      })
    })

    it('returns all deleted fileNames', async () => {
      const deletedFiles = await getDeletedFiles({
        filePatterns,
        baseSha: '99561ef',
        sha: '2eb2427',
        cwd: GITHUB_WORKSPACE ? GITHUB_WORKSPACE : process.cwd(),
        diff: '...'
      })

      expect(deletedFiles).toContain(path.join(topLevelDir, 'entrypoint.sh'))
    })
  })
})
