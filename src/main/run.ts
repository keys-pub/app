import {spawn, exec} from 'child_process'
import * as fs from 'fs'

export type ExecOut = {
  stdout: string
  stderr: string
}

export const execProc = (path: string, args: string): Promise<ExecOut> => {
  return new Promise((resolve, reject) => {
    if (!path) {
      reject('No path to exec')
      return
    }
    // Include quotes for paths with spaces
    let cmd = `"` + path + `"`
    if (args) {
      cmd = cmd + ' ' + args
    }

    console.log('Exec:', cmd)
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      console.log('Exec (done):', path)
      resolve({stdout, stderr})
    })
  })
}

export const spawnProc = (path: string, args: string, killOnExit: boolean): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!path) {
      reject('No path to spawn')
      return
    }

    // Include quotes for paths with spaces
    let cmd = `"` + path + `"`
    if (args) {
      cmd = cmd + ' ' + args
    }

    fs.access(path, fs.constants.X_OK, (err: Error | null) => {
      if (err) {
        reject(err)
        return
      }

      console.log('Executing:', cmd)
      let proc = spawn(cmd, [], {windowsHide: true})
      proc.stdout.on('data', (data) => {
        console.log(`proc (stdout): ${data}`)
      })
      proc.stderr.on('data', (data) => {
        console.error(`proc (stderr): ${data}`)
      })
      proc.on('close', (code) => {
        console.log(`process exited with code ${code}`)
      })
      proc.on('error', (err) => {
        reject(err)
      })

      if (killOnExit) {
        // Kill the process if parent process exits
        process.on('exit', function () {
          proc.kill()
        })
      }

      resolve(null)
    })
  })
}
