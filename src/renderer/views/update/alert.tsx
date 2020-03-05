import * as React from 'react'

import {Box, Snackbar, Typography} from '@material-ui/core'

import {Link} from '../../components'

import Alert from '@material-ui/lab/Alert'

import {store} from '../../store'
import {push} from 'connected-react-router'

import {ipcRenderer} from 'electron'

type Props = {}
type State = {
  open: boolean
  version: string
}

export default class UpdateAlert extends React.Component<Props, State> {
  state = {
    open: false,
    version: '',
  }

  componentDidMount() {
    ipcRenderer.on('update-needed', (event, update) => {
      console.log('Update:', update)
      if (update.needUpdate) {
        this.setState({
          open: true,
          version: update.version,
        })
      }
    })

    ipcRenderer.on('update-check-err', (event, err) => {
      // TODO
      console.error(err)
    })

    ipcRenderer.on('update-apply-err', (event, err) => {
      // TODO
      console.error(err)
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('update-needed')
    ipcRenderer.removeAllListeners('update-err')
  }

  close = () => {
    this.setState({
      open: false,
      version: '',
    })
  }

  apply = () => {
    this.setState({
      open: false,
      version: '',
    })
    ipcRenderer.send('update-apply')
    // TODO: Splash for update
    store.dispatch({type: 'UPDATING'})
  }

  render() {
    return (
      <Snackbar
        open={this.state.open}
        onClose={this.close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
      >
        <Alert onClose={this.close} severity="info">
          <Box>
            <Typography>There is a an update available ({this.state.version}).</Typography>
            <Link onClick={this.apply}>Apply &amp; Restart</Link>
          </Box>
        </Alert>
      </Snackbar>
    )
  }
}
