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
  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.preventDefault()
    // const id = event.currentTarget.id
  }

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
              <Typography style={{...styles.mono}}>RP</Typography>
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={sortField == 'name'}
              direction={direction}
              onClick={() => this.sort(sortField, '???', sortDirection)}
            >
              <Typography style={{...styles.mono}}>User</Typography>
            </TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.credentials.map((cred: Credential, index) => {
          const id = toHex(cred.id)
          console.log('cred:', cred)
          return (
            <TableRow
              hover
              onClick={(event) => select(cred)}
              key={id}
              style={{cursor: 'pointer'}}
              selected={isSelected(cred)}
              component={(props: any) => {
                return <tr onContextMenu={onContextMenu} {...props} id={id} />
              }}
            >
              <TableCell component="th" scope="row" style={{minWidth: 200}}>
                <Typography style={{...styles.mono, ...styles.breakWords}}>
                  {cred.rp.id}
                  <br />
                  {cred.rp.name}
                </Typography>
              </TableCell>
              <TableCell style={{verticalAlign: 'top', minWidth: 200}}>
                <Typography style={{...styles.mono, ...styles.breakWords}}>
                  {cred.user.name}

                  {cred.user.displayName && <span>({cred.user.displayName})</span>}
                </Typography>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
