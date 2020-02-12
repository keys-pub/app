import * as React from 'react'

import {Box, Button, Divider, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

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

interface State {}

const version = remote.app.getVersion()

export default class SettingsView extends React.Component<Props, State> {
  state = {}

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
              <TableCell style={cstyles.cell}>{version}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}></TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="row">
                  <Button size="small" variant="outlined" onClick={() => store.dispatch(push('/debug'))}>
                    Debug Routes
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    style={{marginLeft: 10}}
                    onClick={() => store.dispatch(push('/db'))}
                  >
                    Debug DB
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    )
  }
}
