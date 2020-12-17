import * as React from 'react'

import {Box, Snackbar, Typography} from '@material-ui/core'

import Link from '../components/link'

import Alert from '@material-ui/lab/Alert'
import {platform} from '../env'
import {store} from '../store'
import {ipcRenderer, shell} from 'electron'

export default (_: {}) => {
  const [open, setOpen] = React.useState(false)
  const [version, setVersion] = React.useState('')

  React.useEffect(() => {
    ipcRenderer.on('update-needed', (event, update) => {
      console.log('Update:', update)
      if (update.needUpdate) {
        setOpen(true)
        setVersion(update.version)
      }
    })

    ipcRenderer.on('update-check-err', (event, err) => {
      // TODO: Show snack error?
      console.error(err)
    })

    ipcRenderer.on('update-apply-err', (event, err) => {
      console.error(err)
      store.update((s) => {
        s.error = err
      })
    })

    return function cleanup() {
      ipcRenderer.removeAllListeners('update-needed')
      ipcRenderer.removeAllListeners('update-check-err')
      ipcRenderer.removeAllListeners('update-apply-err')
    }
  })

  const close = () => {
    setOpen(false)
    setVersion('')
  }

  const apply = () => {
    setOpen(false)
    setVersion('')
    ipcRenderer.send('update-apply')
    store.update((s) => {
      s.updating = true
    })
  }

  const openReleases = () => {
    shell.openExternal('https://github.com/keys-pub/app/releases')
  }

  let action
  let actionLabel

  switch (platform()) {
    case 'darwin':
      action = apply
      actionLabel = 'Download & Restart'
      break
    case 'win32':
      action = apply
      actionLabel = 'Download & Restart'
      break
    default:
      action = openReleases
      actionLabel = 'View Releases'
      break
  }

  return (
    <UpdateAlertView open={open} close={close} version={version} action={action} actionLabel={actionLabel} />
  )
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
