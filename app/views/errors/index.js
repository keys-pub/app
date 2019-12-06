// @flow
import React, {Component} from 'react'

import {Box, Button, Typography} from '@material-ui/core'

import ErrorView from './view'

type Props = {
  error: ?Error,
  children: any,
  clearError: () => void,
  restart: () => void,
}

export default class ErrorsView extends Component<Props> {
  render() {
    if (!this.props.error) return this.props.children
    return (
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: 'white',
          height: '100%',
        }}
      >
        <ErrorView error={this.props.error} />
        <Box display="flex" flexDirection="row">
          <Button color="secondary" variant="contained" onClick={this.props.restart}>
            Restart the App
          </Button>
          <Box style={{width: 10}} />
          <Button variant="outlined" onClick={this.props.clearError}>
            Clear Error
          </Button>
        </Box>
      </Box>
    )
  }
}
