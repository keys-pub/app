import * as React from 'react'

import {ThemeProvider} from '@material-ui/styles'
import {theme} from './theme'
import {Router} from 'wouter'

import {Routes, routesMap} from './routes'
import {useLocation} from 'wouter'
import {store, loadStore, Error} from './store'
import {ipcRenderer, remote} from 'electron'

import Auth from './auth'
import AuthSplash from './auth/splash'
import Nav from './nav'

import {Box, Typography} from '@material-ui/core'
import Errors from './errors'
import UpdateAlert from './update/alert'
import UpdateSplash from './update/splash'

import {updateCheck} from './update'
import * as grpc from '@grpc/grpc-js'

import {useHashLocation} from './router'
import {setErrHandler, runtimeStatus} from '../rpc/keys'
import {RuntimeStatusRequest, RuntimeStatusResponse} from '../rpc/keys.d'

import './app.css'

const App = (_: {}) => {
  React.useEffect(() => {
    loadStore()
  }, [])

  return (
    <Box display="flex" flex={1} flexDirection="row" style={{height: '100%'}}>
      <Nav />
      <Routes />
    </Box>
  )
}

const Root = (_: {}) => {
  const [location, setLocation] = useLocation()

  const {ready, unlocked, updating} = store.useState((s) => ({
    ready: s.ready,
    unlocked: s.unlocked,
    updating: s.updating,
  }))

  ipcRenderer.removeAllListeners('preferences')
  ipcRenderer.on('preferences', (event, message) => {
    setLocation('/settings/index')
  })

  if (updating) {
    return <UpdateSplash />
  }

  if (!ready) {
    return <AuthSplash />
  }

  if (!unlocked || location == '/') {
    return <Auth />
  }

  return <App />
}

export default (_: {}) => {
  return (
    <ThemeProvider theme={theme}>
      <Router hook={useHashLocation}>
        <Root />
        <Errors />
        <UpdateAlert />
      </Router>
    </ThemeProvider>
  )
}

ipcRenderer.removeAllListeners('log')
ipcRenderer.on('log', (event, text) => {
  console.log('Main process:', text)
})

// Keys start
ipcRenderer.removeAllListeners('keys-started')
ipcRenderer.on('keys-started', (event, err) => {
  if (err) {
    store.update((s) => {
      s.error = err
    })
  }

  setErrHandler((err: Error) => {
    switch (err.code) {
      case grpc.status.PERMISSION_DENIED:
      case grpc.status.UNAUTHENTICATED:
        store.update((s) => {
          s.unlocked = false
        })
        break
      case grpc.status.UNAVAILABLE:
        store.update((s) => {
          s.unlocked = false
          s.error = err
        })
        break
    }
  })

  store.update((s) => {
    s.ready = true
  })

  // Update check
  updateCheck()
})
ipcRenderer.send('keys-start')

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

// ipcRenderer.on('unresponsive', (event, message) => {})

// ipcRenderer.on('responsive', (event, message) => {})

const ping = async () => {
  console.log('Ping')
  await runtimeStatus({})
}
