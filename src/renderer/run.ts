import {ipcRenderer} from 'electron'
import {store, setLocation, errored} from './store'
import {updateCheck} from './update'
import {rpc} from './rpc/client'

export const serviceStart = () => {
  // Keys start
  ipcRenderer.removeAllListeners('service-started')
  ipcRenderer.on('service-started', (event, err) => {
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
      await rpc.runtimeStatus({})
    }

    const online = () => {
      console.log('Online')
      ping()
    }
    window.addEventListener('online', online)
    // window.addEventListener('offline', offlineFn)

    ipcRenderer.removeAllListeners('focus')
    ipcRenderer.on('focus', (event, message) => {
      store.update((s) => {
        s.focused = true
      })
      ping()
    })

    ipcRenderer.on('blur', (event, message) => {
      store.update((s) => {
        s.focused = false
      })
    })
  })

  // Start service
  ipcRenderer.send('service-start')
}
