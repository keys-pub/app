import {ipcRenderer} from 'electron'
import {store, setLocation, errored} from './store'
import {updateCheck} from './update'
import {keys} from './rpc/client'
import {Config, RuntimeStatusRequest, RuntimeStatusResponse} from '@keys-pub/tsclient/lib/keys'

export const keysStart = () => {
  // Keys start
  ipcRenderer.removeAllListeners('keys-started')
  ipcRenderer.on('keys-started', (event, err) => {
    if (err) {
      errored(err)
      return
    }

    store.update((s) => {
      s.ready = true
    })

    // Update check
    updateCheck()

    const ping = async () => {
      await keys.runtimeStatus({})
    }

    const online = () => {
      console.log('Online')
      ping()
    }
    window.addEventListener('online', online)
    // window.addEventListener('offline', offlineFn)

    ipcRenderer.removeAllListeners('focus')
    ipcRenderer.on('focus', (event, message) => {
      ping()
    })
  })

  // Start keysd
  ipcRenderer.send('keys-start')
}
