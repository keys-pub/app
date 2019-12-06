// @flow
import React, {Fragment} from 'react'
import {remote} from 'electron'
import {render} from 'react-dom'
import {AppContainer as ReactHotAppContainer} from 'react-hot-loader'
import Root from './views/root'

import {configureStore, history} from './store/index'

import {ipcRenderer} from 'electron'

import {initializeClient} from './rpc/client'

import {init} from './views/state'

import './app.global.css'

if (process.env.NODE_ENV === 'development') {
  // $FlowFixMe
  var Immutable = require('immutable')
  var installDevTools = require('immutable-devtools')
  installDevTools(Immutable)
}

const store = configureStore()

const AppContainer = process.env.PLAIN_HMR ? React.Fragment : ReactHotAppContainer

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  // $FlowFixMe
  document.getElementById('root')
)

// Listen for changes in development and hot reload
if (module.hot) {
  module.hot.accept('./views/root', () => {
    // eslint-disable-next-line global-require
    const NextRoot: any = require('./views/root').default
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      // $FlowFixMe
      document.getElementById('root')
    )
  })
}

// Tell main process to start service
ipcRenderer.send('run-service')

// Load credentials
ipcRenderer.on('credentials-loaded', (event, creds, protoPath) => {
  try {
    initializeClient(creds.certPath, creds.authToken, protoPath)
    setTimeout(() => {
      store.dispatch(init())
    }, 0)
  } catch (err) {
    alert('Error initializing client ' + err)
    remote.app.exit(3)
  }
})
ipcRenderer.send('credentials-load')
