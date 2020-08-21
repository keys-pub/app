import {binPath} from './paths'
import {execProc, ExecOut} from './run'
import {app} from 'electron'
import {appPath, appSupportPath} from './paths'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {keysStop} from './service'
import ElectronStore from 'electron-store'

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

export const update = (version: string, apply: boolean): Promise<UpdateResult> => {
  return new Promise(async (resolve, reject) => {
    if (version == '') {
      version = app.getVersion()
      if (process.env.VERSION) {
        version = process.env.VERSION
      }
    }
    console.log('Update, app version:', version)
    let updaterPath = binPath('updater')
    if (process.env.UPDATER_BIN) {
      updaterPath = process.env.UPDATER_BIN
    }
    console.log('Updater path:', updaterPath)
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
        if (fs.existsSync(updaterDest)) {
          fs.unlinkSync(updaterDest)
        }
        console.log('Copying updater to', updaterDest)
        fs.copyFileSync(updaterPath, updaterDest)
        updaterPath = updaterDest

        console.log('Stopping keys...')
        await keysStop()

        // Installer will relaunch on windows.
        relaunch = false
      }
    }

    let args = '-github ' + repo + ' -app-name ' + appName + ' -current ' + version

    // Check for prerelease
    const localStore = new ElectronStore()
    if (localStore.get('prerelease') == '1') {
      args = args + ' -prerelease'
    }

    if (applyPath != '') {
      args = args + ' -download -apply "' + applyPath + '"'
    }

    execProc(updaterPath, args)
      .then((out: ExecOut) => {
        const update = JSON.parse(out.stdout) as Update
        resolve({update, relaunch})
      })
      .catch((err) => {
        reject(err)
      })
  })
}
