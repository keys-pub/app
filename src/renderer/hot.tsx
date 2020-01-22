import {hot} from 'react-hot-loader/root'
import * as React from 'react'

import Root from './views/root'

const Application = () => (
  <div style={{display: 'flex', flexDirection: 'column', flex: 1, height: '100%'}}>
    <Root />
  </div>
)

export default hot(Application)
