import * as React from 'react'

import {
  Box,
  Button,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Table,
  TextField,
  Typography,
} from '@material-ui/core'

import {
  Device,
  RelyingParty,
  RelyingPartiesRequest,
  RelyingPartiesResponse,
} from '@keys-pub/tsclient/lib/fido2'
import {toHex} from '../helper'

import {SortDirection} from '@keys-pub/tsclient/lib/rpc'

import {directionString, flipDirection} from '../helper'

type Props = {
  rps: Array<RelyingParty>
}

export default (props: Props) => {
  let sortField = 'id'
  const sortDirection = SortDirection.ASC
  const direction = directionString(sortDirection)

  const select = (rp: RelyingParty) => {}
  const isSelected = (rp: RelyingParty) => false

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            <TableSortLabel
              active={sortField == 'id'}
              direction={direction}
              // onClick={() => this.sort(sortField, 'id', sortDirection)}
            >
              <Typography variant="body2">ID</Typography>
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={sortField == 'name'}
              direction={direction}
              // onClick={() => this.sort(sortField, 'name', sortDirection)}
            >
              <Typography variant="body2">Name</Typography>
            </TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.rps.map((rp: RelyingParty, index) => {
          return (
            <TableRow
              hover
              onClick={() => select(rp)}
              key={rp.id}
              style={{cursor: 'pointer'}}
              selected={isSelected(rp)}
              // component={(props: any) => {
              //   return <tr onContextMenu={this.onContextMenu} {...props} id={rp.id} />
              // }}
            >
              <TableCell component="th" scope="row" style={{minWidth: 200}}>
                {rp.id}
              </TableCell>
              <TableCell style={{verticalAlign: 'top'}}>{rp.name}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
