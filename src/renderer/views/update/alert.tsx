import * as React from 'react'

import {Box, Snackbar, Typography} from '@material-ui/core'

import {Link} from '../../components'

import Alert from '@material-ui/lab/Alert'
import {platform} from '../../env'
import {store} from '../../store'
import {ipcRenderer, shell} from 'electron'

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
    console.log('UpdateAlert mount')
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
    console.log('UpdateAlert unmount')
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

  openReleases = () => {
    shell.openExternal('https://github.com/keys-pub/app/releases')
  }

  render() {
    let action
    let actionLabel

    switch (platform()) {
      case 'darwin':
        action = this.apply
        actionLabel = 'Download & Restart'
        break
      case 'win32':
        action = this.apply
        actionLabel = 'Download & Restart'
        break
      default:
        action = this.openReleases
        actionLabel = 'View Releases'
        break
    }

    return (
      <UpdateAlertView
        open={this.state.open}
        close={this.close}
        version={this.state.version}
        action={action}
        actionLabel={actionLabel}
      />
    )
  }
}

type UpdateAlertProps = {
  open: boolean
  version: string
  close: () => void
  action: () => void
  actionLabel: string
}

const UpdateAlertView = (props: UpdateAlertProps) => {
  return (
    <Snackbar
      open={props.open}
      onClose={() => {}} // Alert must be closed manually (not via clickaway or timeout)
      anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
    >
      <Alert onClose={props.close} severity="info" elevation={3} style={{paddingTop: 5, paddingBottom: 3}}>
        <Box>
          <Typography>There is a an update available ({props.version}).</Typography>
          <Link onClick={props.action}>{props.actionLabel}</Link>
        </Box>
      </Alert>
    </Snackbar>
  )
}

export {UpdateAlertView}
