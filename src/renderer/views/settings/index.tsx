import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import {Link, styles} from '../../components'
import {remote} from 'electron'

import {store} from '../../store'
import {push} from 'connected-react-router'
import {ipcRenderer} from 'electron'

import * as Store from 'electron-store'

import {vaultAuth} from '../../rpc/keys'
import {RPCError, VaultAuthRequest, VaultAuthResponse} from '../../rpc/keys.d'

type Props = {}

type State = {
  loading: boolean
  prerelease: boolean
  vaultError: string
  vaultPhrase: string
}

const version = remote.app.getVersion()
const localStore = new Store()

export default class SettingsView extends React.Component<Props, State> {
  state = {
    loading: false,
    prerelease: localStore.get('prerelease') == '1',
    vaultError: '',
    vaultPhrase: '',
  }

  devTools = () => {
    const win = remote.getCurrentWindow()
    win.webContents.toggleDevTools()
  }

  forceUpdate = () => {
    // TODO: Test this (if there is no update to force?)
    ipcRenderer.send('update-force')
    store.dispatch({type: 'UPDATING'})
  }

  onPrereleaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    this.setState({prerelease: checked})
    if (checked) {
      localStore.set('prerelease', '1')
    } else {
      localStore.delete('prerelease')
    }
  }

  vaultAuth = () => {
    const req: VaultAuthRequest = {}
    this.setState({loading: true, vaultError: ''})
    vaultAuth(req, (err: RPCError, resp: VaultAuthResponse) => {
      if (err) {
        this.setState({loading: false, vaultError: err.details})
        return
      }
      this.setState({loading: false, vaultPhrase: resp.phrase})
    })
  }

  vaultAuthClear = () => {
    this.setState({vaultPhrase: ''})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Divider />
        <Box paddingTop={2} />
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell style={{...cstyles.cell, width: 150}}>
                <Typography align="right">Version</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Typography>{version}</Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{...cstyles.cell, width: 150}}>
                <Typography align="right">Updater</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.prerelease}
                      color="primary"
                      onChange={this.onPrereleaseChange}
                      style={{paddingTop: 0, paddingBottom: 0}}
                    />
                  }
                  label="Use preleases"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{...cstyles.cell, width: 150}}>
                <Typography align="right">Vault</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box flex={1} flexDirection="column">
                  {this.state.vaultPhrase && (
                    <Box flex={1} flexDirection="column">
                      <Typography style={{paddingBottom: 10}}>
                        This is a vault auth phrase that allows another device to connect to your vault.
                        <br />
                        This one time auth will expire in 5 minutes.
                      </Typography>
                      <Typography style={{...styles.mono, paddingBottom: 5}}>
                        {this.state.vaultPhrase}
                      </Typography>
                      <Link onClick={this.vaultAuthClear}>Clear</Link>
                    </Box>
                  )}
                  {!this.state.vaultPhrase && (
                    <Box flex={1} flexDirection="column">
                      <Typography style={{paddingBottom: 10, width: 400}}>
                        A vault auth phrase is used to allow another device to connect to your vault (it is
                        one time use and expiring).
                      </Typography>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={this.vaultAuth}
                        size="small"
                        disabled={this.state.loading}
                      >
                        Generate Vault Auth
                      </Button>
                    </Box>
                  )}
                  {this.state.vaultError && (
                    <Typography style={{color: 'red', paddingBottom: 20}}>{this.state.vaultError}</Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">Debug</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <Typography>
                    <Link span onClick={() => store.dispatch(push('/db/service'))}>
                      DB (service)
                    </Link>
                    <br />
                    <Link span onClick={() => store.dispatch(push('/db/vault'))}>
                      DB (vault)
                    </Link>
                    <br />
                    <Link span onClick={this.devTools}>
                      Toggle Dev Tools
                    </Link>
                    <br />
                    <Link span onClick={this.forceUpdate}>
                      Force Update
                    </Link>
                    <br />
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
