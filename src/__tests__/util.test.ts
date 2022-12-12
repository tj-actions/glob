import * as path from 'path'
import {normalizeSeparators} from '../utils'

describe('utils test', () => {
  const FILENAMES = path.resolve(__dirname, 'source-files.txt')

  it('normalizeSeparators returns all fileNames with the correct separator', async () => {
    const fileNames = normalizeSeparators(FILENAMES)

    expect(fileNames).toContain('/')
    expect(fileNames).toEqual(expect.not.stringContaining('\\'))
  })
})
