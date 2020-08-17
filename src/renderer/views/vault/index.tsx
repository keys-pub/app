import * as React from 'react'

import {Box, Button, Divider, LinearProgress, Typography} from '@material-ui/core'

import {shell} from 'electron'
import {Link, styles} from '../../components'
import Snack, {SnackProps} from '../../components/snack'

// import EnableDialog from './enable'
import DisableDialog from './disable'

import Header from '../header'

import {dateString} from '../helper'

import {vaultAuth, vaultStatus, vaultSync} from '../../rpc/keys'
import {
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
  openDisable: boolean
  snack?: SnackProps
  snackOpen: boolean
  phrase: string
  status?: VaultStatusResponse
}

export default class VaultView extends React.Component<Props, State> {
  state: State = {
    loading: false,
    openDisable: false,
    phrase: '',
    snackOpen: false,
  }

  componentDidMount() {
    this.status()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props != prevProps) {
      this.status()
    }
  }

  status = () => {
    const req: VaultStatusRequest = {}
    vaultStatus(req)
      .then((resp: VaultStatusResponse) => {
        console.log('Vault status:', resp)
        this.setState({status: resp})
      })
      .catch((err: Error) => {
        this.setState({snack: {message: err.message, alert: 'error'}, snackOpen: true})
      })
  }

  openDisable = () => {
    this.setState({openDisable: true})
  }

  closeDisable = (snack: string) => {
    this.setState({openDisable: false, snack: {message: snack, duration: 4000}, snackOpen: !!snack})
    this.status()
  }

  vaultAuth = () => {
    const req: VaultAuthRequest = {}
    this.setState({loading: true})
    vaultAuth(req)
      .then((resp: VaultAuthResponse) => {
        this.setState({loading: false, phrase: resp.phrase || ''})
      })
      .catch((err: Error) => {
        this.setState({loading: false, snack: {message: err.message, alert: 'error'}, snackOpen: true})
      })
  }

  vaultAuthClear = () => {
    this.setState({phrase: ''})
  }

  sync = () => {
    this.setState({loading: true})
    const req: VaultSyncRequest = {}
    vaultSync(req)
      .then((resp: VaultSyncResponse) => {
        this.setState({loading: false})
        this.status()
      })
      .catch((err: Error) => {
        this.setState({loading: false, snack: {message: err.message, alert: 'error'}, snackOpen: true})
      })
  }

  renderEnable() {
    return (
      <Box>
        <Typography variant="h6" style={{paddingBottom: 6}}>
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
        <Button
          color="primary"
          variant="outlined"
          onClick={this.sync}
          disabled={this.state.loading}
          size="small"
        >
          Enable Sync
        </Button>
      </Box>
    )
  }

  renderInfo() {
    return (
      <Box>
        <Typography variant="h6" style={{paddingBottom: 6}}>
          Vault Sync
        </Typography>
        <Typography>
          <span style={{display: 'inline-block', width: 100}}>Vault API Key:</span>
          <span style={{...styles.mono}}>{this.state?.status?.kid}</span>
        </Typography>
        <Typography style={{paddingBottom: 6}}>
          <span style={{display: 'inline-block', width: 100}}>Last Sync: </span>
          {dateString(this.state?.status?.syncedAt)}
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
    )
  }

  renderDelete() {
    return (
      <Box>
        <Typography variant="h6" style={{paddingBottom: 6}}>
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
          onClick={this.openDisable}
          disabled={this.state.loading}
          size="small"
        >
          Delete Vault Sync
        </Button>
      </Box>
    )
  }

  renderAuth() {
    return (
      <Box>
        <Typography variant="h6" style={{paddingBottom: 6}}>
          Connect another Device
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
              Creating a vault auth phrase allows another device to sync to this vault. <br />A generated auth
              phrase expires after 5 minutes and can only be used once.
              <br /> For more details, see{' '}
              <Link span onClick={() => shell.openExternal('https://keys.pub/docs/specs/vault.html')}>
                keys.pub/docs/specs/vault
              </Link>
              .
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
      </Box>
    )
  }

  render() {
    if (!this.state?.status) return null

    const syncEnabled = !!this.state?.status?.kid
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Header />
        {!this.state.loading && <Box style={{marginBottom: 4}} />}
        {this.state.loading && <LinearProgress />}

        {!syncEnabled && <Box style={{marginLeft: 20, marginBottom: 20}}>{this.renderEnable()}</Box>}
        {syncEnabled && (
          <Box>
            <Box style={{marginLeft: 20, marginBottom: 20}}>{this.renderInfo()}</Box>
            <Box style={{marginLeft: 20, marginBottom: 20}}>{this.renderAuth()}</Box>
            <Box style={{marginLeft: 20, marginBottom: 20}}>{this.renderDelete()}</Box>
          </Box>
        )}

        <DisableDialog open={this.state.openDisable} close={(snack) => this.closeDisable(snack)} />
        <Snack
          open={this.state.snackOpen}
          {...this.state.snack}
          onClose={() => this.setState({snackOpen: false})}
        />
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
