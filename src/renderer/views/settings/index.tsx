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

import Header from '../header'
import ElectronStore from 'electron-store'
import {Store} from '../../store'
import {useLocation} from 'wouter'

const version = remote.app.getVersion()
const localStore = new ElectronStore()

export default (props: {}) => {
  const [prerelease, setPrerelease] = React.useState(localStore.get('prerelease') == '1')

  const [location, setLocation] = useLocation()

  const devTools = () => {
    const win = remote.getCurrentWindow()
    win.webContents.toggleDevTools()
  }

  const forceUpdate = () => {
    ipcRenderer.send('update-force')
    Store.update((s) => {
      s.updating = true
    })
  }

  const onPrereleaseChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    setPrerelease(checked)
    if (checked) {
      localStore.set('prerelease', '1')
    } else {
      localStore.delete('prerelease')
    }
  }, [])

  const labelWidth = 60
  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Header />
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
                    checked={prerelease}
                    color="primary"
                    onChange={onPrereleaseChange}
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
                  <Link span onClick={() => setLocation('/db/service')}>
                    DB (service)
                  </Link>
                  <br />
                  <Link span onClick={() => setLocation('/db/vault')}>
                    DB (vault)
                  </Link>
                  <br />
                  <Link span onClick={devTools}>
                    Toggle Dev Tools
                  </Link>
                  <br />
                  <Link span onClick={forceUpdate}>
                    Force Update
                  </Link>
                  <br />
                  <Link span onClick={() => setLocation('/style-guide')}>
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

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 10,
    verticalAlign: 'top',
  },
}
