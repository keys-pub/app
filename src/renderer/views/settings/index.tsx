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

import {Link} from '../../components'
import {ipcRenderer, remote} from 'electron'

import ElectronStore from 'electron-store'
import {Store} from '../../store/pull'
import {useLocation} from 'wouter'

type Props = {
  setUpdating: () => void
  setLocation: (path: string) => void
}

type State = {
  prerelease: boolean
}

const version = remote.app.getVersion()
const localStore = new ElectronStore()

export default (props: {}) => {
  const [location, setLocation] = useLocation()
  const setUpdating = () => {
    Store.update((s) => {
      s.updating = true
    })
  }
  return <SettingsView setUpdating={setUpdating} setLocation={setLocation} />
}

class SettingsView extends React.Component<Props, State> {
  state = {
    prerelease: localStore.get('prerelease') == '1',
  }

  devTools = () => {
    const win = remote.getCurrentWindow()
    win.webContents.toggleDevTools()
  }

  forceUpdate = () => {
    ipcRenderer.send('update-force')
    this.props.setUpdating()
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
    const labelWidth = 60
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Box paddingTop={1} />
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell style={{...cstyles.cell, width: labelWidth}}>
                <Typography align="right">Version</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Typography>{version}</Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{...cstyles.cell, width: labelWidth}}>
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
                  label="Prereleases"
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
                    <Link span onClick={() => this.props.setLocation('/db/service')}>
                      DB (service)
                    </Link>
                    <br />
                    <Link span onClick={() => this.props.setLocation('/db/vault')}>
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
                    <Link span onClick={() => this.props.setLocation('/style-guide')}>
                      Style Guide
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
    paddingBottom: 10,
    verticalAlign: 'top',
  },
}
