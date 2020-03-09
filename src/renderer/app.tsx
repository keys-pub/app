import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'
import Application from './hot'

import {ipcRenderer, remote} from 'electron'
import {store} from './store'
import {init} from './views/state'

import {updateCheck} from './views/update'

// import * as util from 'util'

import './app.css'

// if (process.env.NODE_ENV === 'development') {
//   var Immutable = require('immutable')
//   var installDevTools = require('immutable-devtools')
//   installDevTools(Immutable)
// }

const mainElement = document.createElement('div')
mainElement.setAttribute('id', 'root')
document.body.appendChild(mainElement)

const render = (Component: () => JSX.Element) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    mainElement
  )
}

render(Application)

ipcRenderer.removeAllListeners('log')
ipcRenderer.on('log', function(event, text) {
  console.log('Main process:', text)
})

// Keys start
ipcRenderer.removeAllListeners('keys-started')
ipcRenderer.on('keys-started', (event, err) => {
  if (err) {
    alert('Oops, exec error: ' + err.toString())
    remote.app.exit(2)
  }
  init()
})
ipcRenderer.send('keys-start')

// Update check
updateCheck()
