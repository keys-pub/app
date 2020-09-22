import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Root from './root'

ReactDOM.render(<Root />, document.getElementById('root'))

if (module.hot) {
  module.hot.accept()
}
