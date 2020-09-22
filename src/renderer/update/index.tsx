import {ipcRenderer} from 'electron'

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

export const updateCheck = () => {
  ipcRenderer.send('update-check')
}
