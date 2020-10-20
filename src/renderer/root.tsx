import * as React from 'react'

import {ThemeProvider} from '@material-ui/styles'
import {theme} from './theme'

import Routes from './routes'
import {store, setLocation, errored} from './store'
import {closeSnack} from './snack'
import {ipcRenderer, remote} from 'electron'
import Snack, {SnackProps} from './components/snack'

import Auth from './auth'
import AuthSplash from './auth/splash'
import Nav from './nav'
import App from './app'

import {Box, Typography} from '@material-ui/core'
import Errors from './errors'
import UpdateAlert from './update/alert'
import UpdateSplash from './update/splash'

import {updateCheck} from './update'

import {keys} from './rpc/client'
import {Config, RuntimeStatusRequest, RuntimeStatusResponse} from '@keys-pub/tsclient/lib/keys'

import './app.css'

const Root = (_: {}) => {
  const {ready, unlocked, updating} = store.useState((s) => ({
    ready: s.ready,
    unlocked: s.unlocked,
    updating: s.updating,
  }))

  ipcRenderer.removeAllListeners('preferences')
  ipcRenderer.on('preferences', (event, message) => {
    setLocation('/settings')
  })

  if (updating) {
    return <UpdateSplash />
  }

  if (!ready) {
    return <AuthSplash />
  }

  if (!unlocked) {
    return <Auth />
  }

  return <App />
}

export default (_: {}) => {
  const onContextMenu = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const labels = [] as string[]
    ipcRenderer.on('context-menu', (e, arg: {label?: string; close?: boolean}) => {
      if (arg.close) {
        ipcRenderer.removeAllListeners('context-menu')
      }
    })
    ipcRenderer.send('context-menu', {labels: [], x: event.clientX, y: event.clientY})
  }, [])

  const {snack, snackOpen} = store.useState((s) => ({
    snack: s.snack,
    snackOpen: s.snackOpen,
  }))

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flex={1} flexDirection="row" style={{height: '100%'}} onContextMenu={onContextMenu}>
        <Root />
        <Errors />
        <UpdateAlert />
        <Snack open={snackOpen} {...snack} onClose={closeSnack} />
      </Box>
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
    errored(err)
    return
  }

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
  await keys.RuntimeStatus({})
}

window.addEventListener('error', (event) => {
  event.preventDefault()
  console.log('Unhandled error', event)
  errored(event.error || event)
})

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault()
  console.log('Unhandled rejection', event)
  errored(event.reason)
})
