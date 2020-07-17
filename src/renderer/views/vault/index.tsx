import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  LinearProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'
import {shell} from 'electron'
import {Link, styles} from '../../components'

// import EnableDialog from './enable'
import DisableDialog from './disable'
import {store} from '../../store'

import {dateString} from '../helper'

import {vaultAuth, vaultStatus, vaultSync} from '../../rpc/keys'
import {
  RPCError,
  VaultAuthRequest,
  VaultAuthResponse,
  VaultSyncRequest,
  VaultSyncResponse,
  VaultStatusRequest,
  VaultStatusResponse,
} from '../../rpc/keys.d'

type Props = {}

type State = {
  loading: boolean
  enableError: string
  openDisable: boolean
  openSnack: string
  phraseError: string
  phrase: string
  status: VaultStatusResponse
}

export default class VaultView extends React.Component<Props, State> {
  state = {
    loading: false,
    enableError: '',
    openDisable: false,
    openSnack: '',
    phrase: '',
    phraseError: '',
    status: null,
  }

  componentDidMount() {
    this.status()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props != prevProps) {
      this.status()
    }
  }

  status = () => {
    const req: VaultStatusRequest = {}
    this.setState({status: null})
    vaultStatus(req, (err: RPCError, resp: VaultStatusResponse) => {
      if (err) {
        store.dispatch({type: 'ERROR', payload: {error: err}})
        return
      }
      console.log('Vault status:', resp)
      this.setState({status: resp})
    })
  }

  openDisable = () => {
    this.setState({openDisable: true})
  }

  closeDisable = (snack: string) => {
    this.setState({openDisable: false, openSnack: snack})
    this.status()
  }

  vaultAuth = () => {
    const req: VaultAuthRequest = {}
    this.setState({loading: true, phraseError: ''})
    vaultAuth(req, (err: RPCError, resp: VaultAuthResponse) => {
      if (err) {
        this.setState({loading: false, phraseError: err.details})
        return
      }
      this.setState({loading: false, phrase: resp.phrase})
    })
  }

  vaultAuthClear = () => {
    this.setState({phrase: ''})
  }

  sync = () => {
    this.setState({loading: true, enableError: ''})
    const req: VaultSyncRequest = {}
    vaultSync(req, (err: RPCError, resp: VaultSyncResponse) => {
      if (err) {
        this.setState({loading: false, enableError: err.details})
        return
      }
      this.setState({loading: false})
      this.status()
    })
  }

  render() {
    const syncEnabled = !!this.state?.status?.kid
    console.log('Sync enabled:', syncEnabled)

    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Divider />
        {!this.state.loading && <Box style={{marginBottom: 4}} />}
        {this.state.loading && <LinearProgress />}

        <Box display="flex" flexDirection="column" paddingLeft={3} style={{marginTop: 6}}>
          <Typography variant="h6" style={{paddingBottom: 6}}>
            Vault Backup &amp; Sync
          </Typography>

          {!syncEnabled && (
            <Box>
              <Typography style={{paddingBottom: 10}}>
                Enabling sync backs up your vault to the server and allows you to sync with other devices.
                <br /> Vault items are encrypted when stored on the keys.pub server.
                <br /> For more details visit{' '}
                <Link span onClick={() => shell.openExternal('https://keys.pub/docs/vault')}>
                  keys.pub/docs/vault
                </Link>
                .
              </Typography>
              <Button
                color="primary"
                variant="outlined"
                onClick={this.sync}
                disabled={this.state.loading}
                size="small"
              >
                Enable Backup &amp; Sync
              </Button>
            </Box>
          )}
          {syncEnabled && (
            <Box>
              <Box style={{paddingBottom: 10}}>
                <Typography>
                  <span style={{display: 'inline-block', width: 100}}>Vault Key ID:</span>
                  <span style={{...styles.mono}}>{this.state?.status?.kid}</span>
                </Typography>
                <Typography paragraph>
                  <span style={{display: 'inline-block', width: 100}}>Last Sync: </span>
                  {dateString(this.state?.status?.syncedAt)}
                </Typography>

                <Typography style={{marginBottom: 6}}>
                  Syncing will happen automatically, or you can sync manually.
                </Typography>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={this.sync}
                  disabled={this.state.loading}
                  size="small"
                >
                  Sync Now
                </Button>
              </Box>

              <Typography style={{paddingBottom: 10}}>
                Removing the backup and sync will delete the vault from the server.
                <br />
                Other devices that sync with this vault will also stop syncing.
                <br />
                For more details visit{' '}
                <Link span onClick={() => shell.openExternal('https://keys.pub/docs/vault')}>
                  keys.pub/docs/vault
                </Link>
                .
              </Typography>
              <Button
                color="secondary"
                variant="outlined"
                onClick={this.openDisable}
                disabled={this.state.loading}
                size="small"
                style={{marginBottom: 10}}
              >
                Remove Backup and Disable Sync
              </Button>
            </Box>
          )}
        </Box>

        {syncEnabled && (
          <Box>
            <Box display="flex" flexDirection="column" paddingTop={1} paddingLeft={3} paddingBottom={2}>
              <Typography variant="h6" style={{paddingBottom: 6}}>
                Auth
              </Typography>
              {this.state.phrase && (
                <Box flex={1} flexDirection="column">
                  <Typography style={{paddingBottom: 10, maxWidth: 500}}>
                    This is a vault auth phrase that allows another device to sync with this vault.
                    <br />
                    This will expire in 5 minutes.
                  </Typography>
                  <Typography style={{...styles.mono, paddingBottom: 5, width: 500}}>
                    {this.state.phrase}
                  </Typography>
                  <Link onClick={this.vaultAuthClear}>Clear</Link>
                </Box>
              )}
              {!this.state.phrase && (
                <Box flex={1} flexDirection="column">
                  <Typography style={{paddingBottom: 10, maxWidth: 500}}>
                    A vault auth phrase allows another device to sync to this vault. <br />A generated auth
                    phrase expires after 5 minutes and can only be used once.
                  </Typography>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={this.vaultAuth}
                    disabled={this.state.loading}
                    size="small"
                  >
                    Generate Vault Auth Phrase
                  </Button>
                </Box>
              )}
              {this.state.phraseError && (
                <Typography style={{color: 'red', paddingBottom: 20}}>{this.state.phraseError}</Typography>
              )}
            </Box>
          </Box>
        )}
        <DisableDialog open={this.state.openDisable} close={(snack) => this.closeDisable(snack)} />
        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'right'}}
          open={!!this.state.openSnack}
          autoHideDuration={4000}
          onClose={() => this.setState({openSnack: ''})}
        >
          <Alert severity="success">
            <Typography>{this.state.openSnack}</Typography>
          </Alert>
        </Snackbar>
      </Box>
    )
  }
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}
