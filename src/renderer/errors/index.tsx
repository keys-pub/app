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
    ipcRenderer.send('reload-app', {})
  }

  render() {
    return (
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        style={{
          backgroundColor: 'white',
          height: 'calc(100vh - 50px)',
        }}
      >
        <Typography variant="h5" style={{marginBottom: 10, textAlign: 'center'}}>
          Oops, there was an error.
        </Typography>
        <Box style={{overflowY: 'scroll', height: '100%', backgroundColor: 'black'}}>
          <ErrorView error={this.props.error} />
        </Box>
        <Box display="flex" flexDirection="row" paddingTop={2} paddingBottom={2} alignSelf="center">
          <Button color="secondary" variant="contained" onClick={this.restart}>
            Restart the App
          </Button>
          <Box style={{width: 10}} />
        </Box>
      </Box>
    )
  }
}
