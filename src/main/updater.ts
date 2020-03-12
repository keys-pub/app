import {binPath} from './paths'
import {execProc, ExecOut} from './run'
import {app} from 'electron'
import {appPath, appSupportPath} from './paths'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {keysStopSync} from './service'

export type Asset = {
  name: string
  url: string
  digest: string
  digestType: string
  localPath: string
}

export type Update = {
  version: string
  publishedAt: number
  asset: Asset
  needUpdate: boolean
  applied: string
}

const emptyUpdateResult = (): UpdateResult => {
  return {
    update: {
      version: '',
      publishedAt: 0,
      asset: {name: '', url: '', digest: '', digestType: '', localPath: ''},
      needUpdate: false,
      applied: '',
    },
    relaunch: false,
  }
}

export type UpdateResult = {
  update: Update
  relaunch: boolean
}

export const update = async (version: string, apply: boolean): Promise<UpdateResult> => {
  return new Promise((resolve, reject) => {
    if (version == '') {
      version = app.getVersion()
      if (process.env.VERSION) {
        version = process.env.VERSION
      }
    }

    let updaterPath = ''
    if (process.env.NODE_ENV === 'production') {
      updaterPath = binPath('updater')
    }
    if (process.env.UPDATER_BIN) {
      updaterPath = process.env.UPDATER_BIN
    }
    if (!updaterPath) {
      resolve(emptyUpdateResult())
      return
    }

    const repo = 'keys-pub/app'
    const appName = 'Keys'

    let applyPath = ''
    if (apply) {
      applyPath = appPath()
      if (process.env.UPDATER_APPLY) {
        applyPath = process.env.UPDATER_APPLY
      }
    }

    let relaunch = false
    if (applyPath != '') {
      console.log('Apply:', applyPath)
      relaunch = true

      if (os.platform() == 'win32') {
        // Copy updater to support path, so we can update over the installed version.
        const updaterDest = path.join(appSupportPath(), 'updater.exe')
        console.log('Copying updater to', updaterDest)
        fs.copyFileSync(updaterPath, updaterDest)
        updaterPath = updaterDest

        console.log('Stopping keys...')
        keysStopSync()

        // Installer will relaunch on windows.
        relaunch = false
      }
    }

    console.log('Updater path:', updaterPath)
    let cmd = updaterPath + ' -github ' + repo + ' -app-name ' + appName + ' -current ' + version
    if (applyPath != '') {
      cmd = cmd + ' -download -apply "' + applyPath + '"'
    }

    execProc(cmd)
      .then((out: ExecOut) => {
        const update = JSON.parse(out.stdout) as Update
        resolve({update, relaunch})
      })
      .catch(err => {
        reject(err)
      })
  })
}
