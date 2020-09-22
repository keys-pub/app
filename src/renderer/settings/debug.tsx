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

import {Link} from '../components'
import {ipcRenderer} from 'electron'

import {store, setLocation} from '../store'

export default (props: {}) => {
  const devTools = () => {
    ipcRenderer.send('toggle-dev-tools', {})
  }

  const forceUpdate = () => {
    ipcRenderer.send('update-force')
    store.update((s) => {
      s.updating = true
    })
  }

  const showError = () => {
    store.update((s) => {
      s.error = new Error('Test error '.repeat(1024))
    })
  }

  const restart = () => {
    ipcRenderer.send('reload-app', {})
  }

  const labelWidth = 60
  return (
    <Box display="flex" flex={1} flexDirection="column" style={{marginTop: 10, marginLeft: 15}}>
      <Box display="flex" flexDirection="column">
        <Typography>
          <Link span onClick={() => setLocation('/settings/debug/db/service')}>
            DB
          </Link>
          <br />
          <Link span onClick={() => setLocation('/settings/debug/db/vault')}>
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
          <Link span onClick={() => setLocation('/settings/debug/style-guide')}>
            Style Guide
          </Link>
          <br />
          <Link span onClick={restart}>
            Restart
          </Link>
          <br />
          <Link span onClick={showError}>
            Show Error
          </Link>
          <br />
        </Typography>
      </Box>
    </Box>
  )
}
