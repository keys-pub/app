import * as React from 'react'

import {
  Box,
  Button,
  Snackbar,
  SnackbarContent,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Table,
  TextField,
  Typography,
} from '@material-ui/core'

import {RPCError, Device, Credential} from '../../rpc/fido2.d'
import {toHex} from '../helper'

import {SortDirection} from '../../rpc/keys.d'

import {styles} from '../../components'
import {directionString, flipDirection} from '../helper'

type Props = {
  credentials: Array<Credential>
}

export default (props: Props) => {
  let sortField = 'id'
  const sortDirection = SortDirection.ASC
  const direction = directionString(sortDirection)

  const select = (cred: Credential) => {}
  const isSelected = (cred: Credential) => false

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            <TableSortLabel
              active={sortField == 'id'}
              direction={direction}
              onClick={() => this.sort(sortField, 'id', sortDirection)}
            >
              <Typography style={{...styles.mono}}>ID</Typography>
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={sortField == 'name'}
              direction={direction}
              onClick={() => this.sort(sortField, '???', sortDirection)}
            >
              <Typography style={{...styles.mono}}>???</Typography>
            </TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.credentials.map((cred: Credential, index) => {
          const id = toHex(cred.id)
          return (
            <TableRow
              hover
              onClick={(event) => select(cred)}
              key={id}
              style={{cursor: 'pointer'}}
              selected={isSelected(cred)}
              component={(props: any) => {
                return <tr onContextMenu={this.onContextMenu} {...props} id={id} />
              }}
            >
              <TableCell component="th" scope="row" style={{minWidth: 200}}>
                {id}
              </TableCell>
              <TableCell style={{verticalAlign: 'top'}}></TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
