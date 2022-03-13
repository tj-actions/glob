import * as core from '@actions/core'
import {promises as fs} from 'fs'

export async function run(): Promise<void> {
  const pathsOutputFile = core.getState('paths-output-file')

  try {
    await fs.unlink(pathsOutputFile)
    //file removed
  } catch (err) {
    core.setFailed(err as Error)
  }

  core.info(`deleted paths-output-file: ${pathsOutputFile}`)
}

if (!process.env.TESTING) {
  // eslint-disable-next-line github/no-then
  run().catch(e => {
    core.setFailed(e.message || e)
  })
}
