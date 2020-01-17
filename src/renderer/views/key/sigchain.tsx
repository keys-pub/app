import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core'

import {styles, Link} from '../components'
import {NamesView} from '../user/views'

import {connect} from 'react-redux'

import {keyTypeString, keyTypeSymbol, dateString} from '../helper'

import {AppState} from '../../reducers/app'

import {Statement} from '../../rpc/types'
import {RPCState} from '../../rpc/rpc'

type Props = {
  statements: Array<Statement>
}

export default (props: Props) => {
  if (props.statements.length == 0) {
    return null
  }
  return (
    <Box display="flex" flex={1}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Seq</TableCell>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.statements.map((st: Statement) => (
            <TableRow>
              <TableCell>
                <Typography>{st.seq}</Typography>
              </TableCell>
              <TableCell>
                <Typography
                  style={{
                    ...styles.mono,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    wordBreak: 'break-all',
                  }}
                >
                  {
                    // st.data
                  }
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
