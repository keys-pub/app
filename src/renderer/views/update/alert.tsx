import * as React from 'react'

import {Box, Snackbar, Typography} from '@material-ui/core'

import {Link} from '../../components'

import Alert from '@material-ui/lab/Alert'

import {store} from '../../store'
import {ipcRenderer} from 'electron'

export default (props: {}) => {
  const setUpdating = () => {
    store.update((s) => {
      s.updating = true
    })
  }
  return <UpdateAlert setUpdating={setUpdating} />
}

type Props = {
  setUpdating: () => void
}

type State = {
  open: boolean
  version: string
}

class UpdateAlert extends React.Component<Props, State> {
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
    ipcRenderer.removeAllListeners('update-check-err')
    ipcRenderer.removeAllListeners('update-apply-err')
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
    this.props.setUpdating()
  }

  render() {
    return (
      <UpdateAlertView
        open={this.state.open}
        close={this.close}
        version={this.state.version}
        apply={this.apply}
      />
    )
  }
}

const UpdateAlertView = (props: {open: boolean; close: () => void; version: string; apply: () => void}) => {
  return (
    <Snackbar
      open={props.open}
      onClose={() => {}} // Alert must be closed manually (not via clickaway or timeout)
      anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
    >
      <Alert
        onClose={props.close}
        severity="info"
        elevation={3}
        // variant="filled"
        style={{paddingTop: 5, paddingBottom: 3}}
      >
        <Box>
          <Typography>There is a an update available ({props.version}).</Typography>
          <Link onClick={props.apply}>Download &amp; Restart</Link>
        </Box>
      </Alert>
    </Snackbar>
  )
}

export {UpdateAlertView}
