import * as React from 'react'

import {Box, CircularProgress, Typography} from '@material-ui/core'

import {ipcRenderer} from 'electron'
import {store} from '../store'

type Props = {}
type State = {
  loading: boolean
  error: Error | null
}

export default class Splash extends React.Component<Props, State> {
  state = {
    loading: true,
    error: null,
  }

  componentDidMount() {
    ipcRenderer.on('update-apply-err', (event, err) => {
      console.error(err)
      store.update((s) => {
        s.error = err
      })
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('update-apply-err')
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
        {this.state.loading && <CircularProgress size={64} />}
        <Typography style={{fontSize: 20, marginTop: 10}}>Downloading update...</Typography>
      </Box>
    )
  }
}
