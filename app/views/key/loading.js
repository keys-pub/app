// @flow
import React, {Component} from 'react'

import {Box, Button, Divider, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {styles} from '../components'

type Props = {
  kid: string,
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

export default (props: Props) => {
  const kid = props.kid
  return (
    <Box display="flex">
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell style={{...cstyles.cell, width: 100}}>
              <Typography align="right">ID</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="column">
                <Typography style={{...styles.mono, paddingRight: 10, wordWrap: 'break-word'}}>
                  {kid}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}>
              <Typography align="right">User</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}></TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}></TableCell>
            <TableCell style={cstyles.cell}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}
