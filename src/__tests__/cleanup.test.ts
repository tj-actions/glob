import * as core from '@actions/core'
import {promises as fs} from 'fs'

import {exists, tempfile} from '../utils'
import {run} from '../cleanup'

describe('cleanup test', () => {
  it('deletes the paths-output-file', async () => {
    const pathsOutputFile = await tempfile('.txt')
    await fs.writeFile(pathsOutputFile, '12345')

    // @ts-ignore
    core.getState = jest.fn().mockReturnValue(pathsOutputFile)

    expect(await exists(pathsOutputFile)).toBeTruthy()

    await run()

    expect(await exists(pathsOutputFile)).toBeFalsy()
  })
})
