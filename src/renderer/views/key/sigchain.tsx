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

import {breakWords} from '../theme'
import {Statement} from '../../rpc/keys.d'

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
                  variant="body2"
                  style={{
                    ...breakWords,
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
