import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'
import Application from './hot'

import {ipcRenderer} from 'electron'

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

// Tell main process to start service
ipcRenderer.send('run-service')
