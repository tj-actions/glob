import * as core from '@actions/core'
import {promises as fs} from 'fs'

import {tempfile} from '../src/utils'
import {run} from '../src/cleanup'

describe('cleanup test', () => {
  const pathsOutputFile = tempfile('.txt')

  it('deletes the paths-output-file', async () => {
    await fs.writeFile(pathsOutputFile, '12345')

    const fileExists = async (path: string) =>
      !!(await fs.stat(path).catch(() => false))

    // @ts-ignore
    core.getState = jest.fn().mockReturnValue(pathsOutputFile)

    expect(await fileExists(pathsOutputFile)).toBeTruthy()

    await run()

    expect(await fileExists(pathsOutputFile)).toBeFalsy()
  })
})
