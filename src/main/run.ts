import {spawn} from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as getenv from 'getenv'

import {binPath} from './paths'

const spawnProc = (path: string, killOnExit: boolean): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (path === '') {
      reject('No path to spawn')
      return
    }

    fs.access(path, fs.constants.X_OK, (err: Error) => {
      if (err) {
        reject(err)
        return
      }

      let args = []
      args.unshift(path)
      let cmd = args.join(' ')
      console.log('Executing:', cmd)
      let proc = spawn(cmd, [], {windowsHide: true})
      proc.stdout.on('data', data => {})
      proc.stderr.on('data', data => {})
      proc.on('close', code => {
        console.log(`process exited with code ${code}`)
      })
      proc.on('error', err => {
        resolve(err)
      })

      if (killOnExit) {
        // Kill the process if parent process exits
        process.on('exit', function() {
          proc.kill()
        })
      }

      resolve()
    })
  })
}

const runService = (): Promise<any> => {
  if (process.env.NODE_ENV === 'production') {
    const servicePath = binPath('bin/keysd')
    return spawnProc(servicePath, true)
  }

  if (process.env.RUN_SERVICE) {
    return spawnProc(process.env.RUN_SERVICE, true)
  }

  console.warn('No service spawn in dev mode')
  return Promise.resolve()
}

export {runService}
