import * as React from 'react'

import {Box, Button, Divider, LinearProgress, Typography} from '@material-ui/core'

import {shell} from 'electron'
import {Link} from '../components'
import {mono, contentTop} from '../theme'

// import EnableDialog from './enable'
import DisableDialog from './disable'

import Header from '../header'

import {dateString} from '../helper'
import {Store} from 'pullstate'
import {openSnack, openSnackError} from '../snack'

import {keys} from '../rpc/client'
import {
  VaultAuthRequest,
  VaultAuthResponse,
  VaultSyncRequest,
  VaultSyncResponse,
  VaultStatusRequest,
  VaultStatusResponse,
} from '@keys-pub/tsclient/lib/keys.d'

type State = {
  phrase: string
  status: VaultStatusResponse | null
}

const store = new Store<State>({
  phrase: '',
  status: null,
})

export default (_: {}) => {
  const [loading, setLoading] = React.useState(false)
  const [disableOpen, setDisableOpen] = React.useState(false)

  const {phrase, status} = store.useState()

  React.useEffect(() => {
    reloadStatus()
  }, [])

  const reloadStatus = async () => {
    try {
      const req: VaultStatusRequest = {}
      const resp = await keys.VaultStatus(req)
      console.log('Vault status:', resp)
      store.update((s) => {
        s.status = resp
      })
    } catch (err) {
      openSnackError(err)
    }
  }

  const generateAuth = async () => {
    setLoading(true)
    try {
      const resp = await keys.VaultAuth({})
      store.update((s) => {
        s.phrase = resp.phrase || ''
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  const authClear = () => {
    store.update((s) => {
      s.phrase = ''
    })
  }

  const sync = async () => {
    setLoading(true)
    try {
      const resp = await keys.VaultSync({})
      setLoading(false)
      reloadStatus()
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  const closeDisable = (snack: string) => {
    setDisableOpen(false)
    if (snack) openSnack({message: snack, duration: 4000})
    reloadStatus()
  }

  const renderEnable = () => {
    return (
      <Box>
        <Typography variant="h4" style={{paddingBottom: 6}}>
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
        <Typography variant="h4" style={{paddingBottom: 6}}>
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
        <Typography variant="h4" style={{paddingBottom: 6}}>
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
        <Typography variant="h4" style={{paddingBottom: 6}}>
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

  const left = 12

  return (
    <Box display="flex" flex={1} flexDirection="column" style={{position: 'relative'}}>
      <Box style={{position: 'absolute', top: 0, width: '100%'}}>{loading && <LinearProgress />}</Box>
      <Box display="flex" flex={1} flexDirection="column" style={{marginTop: contentTop}}>
        {!syncEnabled && <Box style={{marginLeft: left, marginBottom: 20}}>{renderEnable()}</Box>}
        {syncEnabled && (
          <Box>
            <Box style={{marginLeft: left, marginBottom: 20}}>{renderInfo()}</Box>
            <Box style={{marginLeft: left, marginBottom: 20}}>{renderAuth()}</Box>
            <Box style={{marginLeft: left, marginBottom: 20}}>{renderDelete()}</Box>
          </Box>
        )}
      </Box>

      <DisableDialog open={disableOpen} close={closeDisable} />
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
