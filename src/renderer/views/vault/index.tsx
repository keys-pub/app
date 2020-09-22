import * as React from 'react'

import {Box, Button, Divider, LinearProgress, Typography} from '@material-ui/core'

import {shell} from 'electron'
import {Link} from '../../components'
import {mono} from '../theme'

import Snack, {SnackProps} from '../../components/snack'

// import EnableDialog from './enable'
import DisableDialog from './disable'

import Header from '../header'

import {dateString} from '../helper'
import {Store} from 'pullstate'

import {vaultAuth, vaultStatus, vaultSync} from '../../rpc/keys'
import {
  VaultAuthRequest,
  VaultAuthResponse,
  VaultSyncRequest,
  VaultSyncResponse,
  VaultStatusRequest,
  VaultStatusResponse,
} from '../../rpc/keys.d'

type State = {
  phrase: string
  status: VaultStatusResponse | null
}

const store = new Store<State>({
  phrase: '',
  status: null,
})

export default (_: {}) => {
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [disableOpen, setDisableOpen] = React.useState(false)

  const {phrase, status} = store.useState()

  React.useEffect(() => {
    reloadStatus()
  }, [])

  const reloadStatus = async () => {
    try {
      const req: VaultStatusRequest = {}
      const resp = await vaultStatus(req)
      console.log('Vault status:', resp)
      store.update((s) => {
        s.status = resp
      })
    } catch (err) {
      setSnack({message: err.message, alert: 'error'})
      setSnackOpen(true)
    }
  }

  const generateAuth = () => {
    setLoading(true)
    const req: VaultAuthRequest = {}
    vaultAuth(req)
      .then((resp: VaultAuthResponse) => {
        store.update((s) => {
          s.phrase = resp.phrase || ''
        })
        setLoading(false)
      })
      .catch((err: Error) => {
        setLoading(false)
        setSnack({message: err.message, alert: 'error'})
        setSnackOpen(true)
      })
  }

  const authClear = () => {
    store.update((s) => {
      s.phrase = ''
    })
  }

  const sync = async () => {
    setLoading(true)
    try {
      const resp = await vaultSync({})
      setLoading(false)
      reloadStatus()
    } catch (err) {
      setLoading(false)
      setSnack({message: err.message, alert: 'error'})
      setSnackOpen(true)
    }
  }

  const closeDisable = (snack: string) => {
    setDisableOpen(false)
    setSnack({message: snack, duration: 4000})
    setSnackOpen(!!snack)
    reloadStatus()
  }

  const renderEnable = () => {
    return (
      <Box>
        <Typography variant="h5" style={{paddingBottom: 6}}>
          Vault Sync
        </Typography>
        <Typography style={{paddingBottom: 6}}>
          Enabling sync saves your vault to the server and allows you to sync with other devices.
          <br /> Vault items are encrypted when stored on the keys.pub server.
          <br /> For more details, see{' '}
          <Link span onClick={() => shell.openExternal('https://keys.pub/docs/specs/vault.html')}>
            keys.pub/docs/specs/vault
          </Link>
          .
        </Typography>
        <Button color="primary" variant="outlined" onClick={sync} disabled={loading} size="small">
          Enable Sync
        </Button>
      </Box>
    )
  }

  const renderInfo = () => {
    return (
      <Box>
        <Typography variant="h5" style={{paddingBottom: 6}}>
          Vault Sync
        </Typography>
        <Typography>
          <span style={{display: 'inline-block', width: 100}}>Vault API Key:</span>
          <span style={{...mono}}>{status?.kid}</span>
        </Typography>
        <Typography style={{paddingBottom: 6}}>
          <span style={{display: 'inline-block', width: 100}}>Last Sync: </span>
          {dateString(status?.syncedAt)}
        </Typography>

        <Button color="primary" variant="outlined" onClick={sync} disabled={loading} size="small">
          Sync Now
        </Button>
      </Box>
    )
  }

  const renderDelete = () => {
    return (
      <Box>
        <Typography variant="h5" style={{paddingBottom: 6}}>
          Delete Vault Sync
        </Typography>
        <Typography style={{paddingBottom: 10}}>
          This action will remove the vault backup from the server and disable syncing.
          <br />
          Other devices that sync with this vault will stop syncing.
          <br />
          For more details, see{' '}
          <Link span onClick={() => shell.openExternal('https://keys.pub/docs/specs/vault.html')}>
            keys.pub/docs/specs/vault
          </Link>
          .
        </Typography>
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => setDisableOpen(true)}
          disabled={loading}
          size="small"
        >
          Delete Vault Sync
        </Button>
      </Box>
    )
  }

  const renderAuth = () => {
    return (
      <Box>
        <Typography variant="h5" style={{paddingBottom: 6}}>
          Connect another Device
        </Typography>
        {phrase && (
          <Box flex={1} flexDirection="column">
            <Typography style={{paddingBottom: 10, maxWidth: 500}}>
              This is a vault auth phrase that allows another device to sync with this vault.
              <br />
              This will expire in 5 minutes.
            </Typography>
            <Typography variant="body2" style={{paddingBottom: 5, width: 500}}>
              {phrase}
            </Typography>
            <Link onClick={authClear}>Clear</Link>
          </Box>
        )}
        {!phrase && (
          <Box flex={1} flexDirection="column">
            <Typography style={{paddingBottom: 10, maxWidth: 500}}>
              Creating a vault auth phrase allows another device to sync to this vault. <br />A generated auth
              phrase expires after 5 minutes and can only be used once.
              <br /> For more details, see{' '}
              <Link span onClick={() => shell.openExternal('https://keys.pub/docs/specs/vault.html')}>
                keys.pub/docs/specs/vault
              </Link>
              .
            </Typography>
            <Button color="primary" variant="outlined" onClick={generateAuth} disabled={loading} size="small">
              Generate Vault Auth Phrase
            </Button>
          </Box>
        )}
      </Box>
    )
  }

  if (!status) return null
  const syncEnabled = !!status?.kid

  return (
    <Box display="flex" flex={1} flexDirection="column" style={{position: 'relative'}}>
      <Box style={{position: 'absolute', top: 0, width: '100%'}}>{loading && <LinearProgress />}</Box>
      <Box display="flex" flex={1} flexDirection="column" style={{marginTop: 10}}>
        {!syncEnabled && <Box style={{marginLeft: 15, marginBottom: 20}}>{renderEnable()}</Box>}
        {syncEnabled && (
          <Box>
            <Box style={{marginLeft: 15, marginBottom: 20}}>{renderInfo()}</Box>
            <Box style={{marginLeft: 15, marginBottom: 20}}>{renderAuth()}</Box>
            <Box style={{marginLeft: 15, marginBottom: 20}}>{renderDelete()}</Box>
          </Box>
        )}
      </Box>

      <DisableDialog open={disableOpen} close={closeDisable} />
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}
