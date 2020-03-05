import {binPath} from './paths'
import {execProc, ExecOut} from './run'
import {app} from 'electron'

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

export const update = (apply: boolean): Promise<Update> => {
  return new Promise((resolve, reject) => {
    let path = ''

    if (process.env.NODE_ENV === 'production') {
      path = binPath('bin/updater')
    }

    if (process.env.UPDATER_BIN) {
      path = process.env.UPDATER_BIN
    }

    if (!path) {
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
      applyPath = app.getAppPath()
      if (process.env.UPDATER_APPLY) {
        applyPath = process.env.UPDATER_APPLY
      }
    }

    console.log('Updater path:', path)
    if (applyPath != '') {
      console.log('Apply:', applyPath)
    }

    let cmd = path + ' -github ' + repo + ' -app-name ' + appName + ' -current ' + version + ' -download'
    if (applyPath != '') {
      cmd = cmd + ' -apply "' + applyPath + '"'
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
