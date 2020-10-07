import * as React from 'react'

import {Box} from '@material-ui/core'

import Logo from '../logo'
import Header from '../header'

export default (_: {}) => (
  <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
    <Header noBack />
    <Logo top={100} />
  </Box>
)
