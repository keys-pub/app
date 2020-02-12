import {spawn, exec} from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as getenv from 'getenv'

import {binPath} from './paths'

const execProc = (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (path === '') {
      reject('No path to exec')
      return
    }
    exec(path, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`)
        reject(err)
        return
      }
      // console.log(`exec (stdout): ${stdout}`)
      if (stderr) {
        console.error(`exec (stderr): ${stderr}`)
      }
      resolve()
    })
  })
}

export const keysStart = (): Promise<any> => {
  let keysPath = ''

  if (process.env.NODE_ENV === 'production') {
    keysPath = binPath('bin/keys')
  }

  if (process.env.KEYS_BIN) {
    keysPath = process.env.KEYS_BIN
  }

  console.log('Keys bin:', keysPath)
  if (keysPath) {
    return execProc(keysPath + ' restart')
  }

  return Promise.resolve()
}

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
      proc.stdout.on('data', data => {
        console.log(`proc (stdout): ${data}`)
      })
      proc.stderr.on('data', data => {
        console.error(`proc (stderr): ${data}`)
      })
      proc.on('close', code => {
        console.log(`process exited with code ${code}`)
      })
      proc.on('error', err => {
        reject(err)
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

export const keysd = (): Promise<any> => {
  if (process.env.NODE_ENV === 'production') {
    const servicePath = binPath('bin/keysd')
    return spawnProc(servicePath, true)
  }

  console.log('process.env.KEYSD', process.env.KEYSD_BIN)
  if (process.env.KEYSD_BIN) {
    return spawnProc(process.env.KEYSD_BIN, true)
  }

  console.warn('No service spawn in dev mode')
  return Promise.resolve()
}
