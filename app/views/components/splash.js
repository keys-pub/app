// @flow
import React, {Component} from 'react'

import {Box, CircularProgress} from '@material-ui/core'

type Props = {}
type State = {
  loading?: boolean,
}

export default class Splash extends Component<Props, State> {
  state = {}
  tid: TimeoutID

  componentDidMount() {
    this.tid = setTimeout(() => {
      this.setState({loading: true})
    }, 1000)
  }

  componentWillUnmount() {
    clearTimeout(this.tid)
  }

  render() {
    return (
      <Box
        display="flex"
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{height: '100%'}}
      >
        {this.state.loading && <CircularProgress size={128} />}
      </Box>
    )
  }
}
