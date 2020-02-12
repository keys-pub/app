import * as React from 'react'

import {Box, Button, Typography} from '@material-ui/core'

import ErrorView from './view'

import {ipcRenderer} from 'electron'
import {store} from '../store'

type Props = {
  error: Error | void
}

export default class ErrorsView extends React.Component<Props> {
  restart = () => {
    ipcRenderer.send('restart-app', {})
  }

  clearError = () => {
    store.dispatch({
      type: 'CLEAR_ERROR',
    })
  }

  render() {
    return (
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        style={{
          backgroundColor: 'white',
          height: '100%',
        }}
      >
        <Box className="drag" style={{width: '100%', height: 40, cursor: 'move'}} />
        <ErrorView error={this.props.error} />
        <Box display="flex" flexDirection="row" paddingTop={2} paddingBottom={2} alignSelf="center">
          <Button color="secondary" variant="contained" onClick={this.restart}>
            Restart the App
          </Button>
          <Box style={{width: 10}} />
          <Button variant="outlined" onClick={this.clearError}>
            Clear Error
          </Button>
        </Box>
      </Box>
    )
  }
}
