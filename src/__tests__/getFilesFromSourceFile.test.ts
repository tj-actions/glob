import * as path from 'path'
import {getFilesFromSourceFile} from '../utils'

describe('getFilesFromSourceFile test', () => {
  const filePaths = new Array(2)
    .fill(path.resolve(__dirname, 'source-files.txt'))
    .flat()

  it('generator returns all fileNames', async () => {
    const expectedFilePaths = ['*.md', '**.yaml', '**/greetings.yml', '!**.yml']

    const fileNames = await getFilesFromSourceFile({filePaths})
    const expectedFileNames = new Array(2).fill(expectedFilePaths).flat()

    expect(fileNames).toEqual(expectedFileNames)
  })

  it('generator returns all excluded fileNames', async () => {
    const expectedFilePaths = [
      '!*.md',
      '!**.yaml',
      '!**/greetings.yml',
      '!**.yml'
    ]

    const fileNames = await getFilesFromSourceFile({
      filePaths,
      excludedFiles: true
    })
    const expectedFileNames = new Array(2).fill(expectedFilePaths).flat()

    expect(fileNames).toEqual(expectedFileNames)
  })
})
