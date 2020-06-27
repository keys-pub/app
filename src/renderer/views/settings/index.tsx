import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import {Link} from '../../components'
import {remote} from 'electron'

import {store} from '../../store'
import {push} from 'connected-react-router'
import {ipcRenderer} from 'electron'

import * as Store from 'electron-store'

type Props = {}

type State = {
  prerelease: boolean
}

const version = remote.app.getVersion()
const localStore = new Store()

export default class SettingsView extends React.Component<Props, State> {
  state = {
    prerelease: localStore.get('prerelease') == '1',
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
                <Typography align="right">Prereleases</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Checkbox
                  checked={this.state.prerelease}
                  color="primary"
                  onChange={this.onPrereleaseChange}
                  style={{padding: 0}}
                />
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
