import * as React from 'react'

import {Box} from '@material-ui/core'

import Header from './header'

type Props = {}

export default class AuthSplash extends React.Component<Props> {
  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Header loading={false} top={60} />
      </Box>
    )
  }
}
