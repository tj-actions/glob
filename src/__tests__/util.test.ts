import * as path from 'path'
import {escapeString, getDeletedFiles, normalizeSeparators} from '../utils'

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

  describe('escapeString', () => {
    // Returns the input string if it contains no special characters
    it('should return the input string when it contains no special characters', () => {
      const input = 'hello world'
      const result = escapeString(input)
      expect(result).toBe(input)
    })

    // Escapes special characters for bash shell if they exist in the input string
    it('should escape special characters for bash shell if they exist in the input string', () => {
      const input = 'hello $world'
      const result = escapeString(input)
      expect(result).toBe('hello \\$world')
    })

    // Escapes square brackets in the input string
    it('should escape square brackets in the input string', () => {
      const input = 'hello [world]'
      const result = escapeString(input)
      expect(result).toBe('hello \\[world\\]')
    })

    // Returns an empty string if the input string is empty
    it('should return an empty string when the input string is empty', () => {
      const input = ''
      const result = escapeString(input)
      expect(result).toBe('')
    })

    // Escapes all special characters if they all exist in the input string
    it('should escape all special characters if they all exist in the input string', () => {
      const input = ':*?<>|;`$()&!'
      const result = escapeString(input)
      expect(result).toBe('\\:\\*\\?\\<\\>\\|\\;\\`\\$\\(\\)\\&\\!')
    })

    // Escapes special characters at the beginning and end of the input string
    it('should escape special characters at the beginning and end of the input string', () => {
      const input = '!hello!'
      const result = escapeString(input)
      expect(result).toBe('\\!hello\\!')
    })
  })
})
