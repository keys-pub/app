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
import {ipcRenderer} from 'electron'

import Header from '../header'
import {store} from '../store'
import {useLocation} from 'wouter'

export default (props: {}) => {
  const [prerelease, setPrerelease] = React.useState(false)
  const [version, setVersion] = React.useState('')

  const [location, setLocation] = useLocation()

  const devTools = () => {
    ipcRenderer.send('toggle-dev-tools', {})
  }

  const forceUpdate = () => {
    ipcRenderer.send('update-force')
    store.update((s) => {
      s.updating = true
    })
  }

  const onPrereleaseChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    setPrerelease(checked)
    ipcRenderer.send('electron-store-set', {key: 'prerelease', value: checked ? '1' : ''})
  }, [])

  React.useEffect(() => {
    const isPrerelease = async () => {
      const prerelease = await ipcRenderer.invoke('electron-store-get', 'prerelease')
      setPrerelease(prerelease == '1')
    }
    isPrerelease()
  }, [])

  const restart = () => {
    ipcRenderer.send('reload-app', {})
  }

  React.useEffect(() => {
    const appVersion = async () => {
      const version: string = await ipcRenderer.invoke('version')
      setVersion(version)
    }
    appVersion()
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
                    DB
                  </Link>
                  <br />
                  <Link span onClick={() => setLocation('/db/vault')}>
                    Vault
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
                  <Link span onClick={restart}>
                    Restart
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
