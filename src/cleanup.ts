import * as core from '@actions/core'
import {promises as fs} from 'fs'

export async function run(): Promise<void> {
  const pathsOutputFile = core.getState('paths-output-file')

  if (pathsOutputFile) {
    await fs.unlink(pathsOutputFile)
    core.info(`deleted paths-output-file: ${pathsOutputFile}`)
  }
}

/* istanbul ignore if */
if (!process.env.TESTING) {
  run().catch((e: Error) => {
    core.setFailed(e.message ?? e)
  })
}
