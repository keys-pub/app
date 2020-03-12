import {binPath} from './paths'
import {execProc, ExecOut} from './run'
import {app} from 'electron'
import {appPath, appSupportPath} from './paths'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {keysStop} from './service'

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

const emptyUpdate = (): Update => {
  return {
    version: '',
    publishedAt: 0,
    asset: {name: '', url: '', digest: '', digestType: '', localPath: ''},
    needUpdate: false,
    applied: '',
  }
}

export const update = async (apply: boolean): Promise<Update> => {
  return new Promise((resolve, reject) => {
    let updaterPath = ''

    if (process.env.NODE_ENV === 'production') {
      updaterPath = binPath('updater')
    }

    if (process.env.UPDATER_BIN) {
      updaterPath = process.env.UPDATER_BIN
    }

    if (!updaterPath) {
      resolve(emptyUpdate())
      return
    }

    let version = app.getVersion()
    if (process.env.VERSION) {
      version = process.env.VERSION
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

    if (applyPath != '') {
      console.log('Apply:', applyPath)

      if (os.platform() == 'win32') {
        const updaterDest = path.join(appSupportPath(), 'updater.exe')
        console.log('Copying updater to', updaterDest)
        fs.copyFileSync(updaterPath, updaterDest)
        updaterPath = updaterDest

        console.log('Stopping keys...')
        keysStop()
      }
    }

    console.log('Updater path:', updaterPath)
    let cmd = updaterPath + ' -github ' + repo + ' -app-name ' + appName + ' -current ' + version
    if (applyPath != '') {
      cmd = cmd + ' -download -apply "' + applyPath + '"'
    }

    const out = execProc(cmd)
      .then((out: ExecOut) => {
        const update = JSON.parse(out.stdout) as Update
        resolve(update)
      })
      .catch(err => {
        reject(err)
      })
  })
}
