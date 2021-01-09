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

import {Device, Credential} from '@keys-pub/tsclient/lib/fido2'
import {toHex} from '../helper'
import {breakWords} from '../theme'

import {SortDirection} from '@keys-pub/tsclient/lib/rpc'

import {directionString, flipDirection} from '../helper'

type Props = {
  credentials: Credential[]
}

export default (props: Props) => {
  let sortField = 'id'
  const sortDirection = SortDirection.ASC
  const direction = directionString(sortDirection)

  const select = (cred: Credential) => {}
  const isSelected = (cred: Credential) => false
  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.preventDefault()
    // const id = event.currentTarget.id
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            <Typography>RP</Typography>
          </TableCell>
          <TableCell>
            <Typography>User</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.credentials.map((cred: Credential, index) => {
          const id = toHex(cred.id || new Uint8Array())
          return (
            <TableRow
              hover
              onClick={() => select(cred)}
              key={id}
              style={{cursor: 'pointer'}}
              selected={isSelected(cred)}
              component={(props: any) => {
                return <tr onContextMenu={onContextMenu} {...props} id={id} />
              }}
            >
              <TableCell component="th" scope="row" style={{minWidth: 200}}>
                <Typography variant="body2" style={{...breakWords}}>
                  {cred.rp!.id}
                  <br />
                  {cred.rp!.name}
                </Typography>
              </TableCell>
              <TableCell style={{verticalAlign: 'top', minWidth: 200}}>
                <Typography variant="body2" style={{...breakWords}}>
                  {cred.user!.name}

                  {cred.user!.displayName && <span>({cred.user!.displayName})</span>}
                </Typography>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
