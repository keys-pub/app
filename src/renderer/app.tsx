import * as React from 'react'
import {remote} from 'electron'
import {render} from 'react-dom'
import Root from './views/root'

import {configureStore, history} from './store/index'

import {ipcRenderer} from 'electron'

import {initializeClient} from './rpc/client'

import {init} from './views/state'

import './app.css'

// if (process.env.NODE_ENV === 'development') {
//   var Immutable = require('immutable')
//   var installDevTools = require('immutable-devtools')
//   installDevTools(Immutable)
// }

const store = configureStore()

const mainElement = document.createElement('div')
document.body.appendChild(mainElement)

render(<Root store={store} history={history} />, mainElement)

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
