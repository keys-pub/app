import * as React from 'react'

import {Box, Button, Divider, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {Link} from '../../components'
import {remote} from 'electron'

import {store} from '../../store'
import {push} from 'connected-react-router'

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

type Props = {}

const version = remote.app.getVersion()

export default class SettingsView extends React.Component<Props> {
  devTools = () => {
    const win = remote.getCurrentWindow()
    win.webContents.toggleDevTools()
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Divider />
        <Box paddingTop={2} />
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell style={{...cstyles.cell, width: 100}}>
                <Typography align="right">Version</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Typography>{version}</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">Debug</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <Link onClick={() => store.dispatch(push('/db'))}>DB</Link>
                  <Link onClick={this.devTools}>Toggle Dev Tools</Link>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    )
  }
}
