import {spawn, exec} from 'child_process'
import * as fs from 'fs'

export type ExecOut = {
  stdout: string
  stderr: string
}

export const execProc = (path: string): Promise<ExecOut> => {
  return new Promise((resolve, reject) => {
    if (path === '') {
      reject('No path to exec')
      return
    }
    console.log('Exec:', path)
    exec(path, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      console.log('Exec (done):', path)
      resolve({stdout, stderr})
    })
  })
}

export const spawnProc = (path: string, killOnExit: boolean): Promise<any> => {
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
