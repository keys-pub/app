import * as React from 'react'

import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {CSSProperties} from '@material-ui/styles'
import {shell} from 'electron'

import {Key, KeyType} from '../../rpc/types'
import ServiceSelect from '../user/service-select'
import {styles, Link} from '../../components'
import UserLabel from '../user/label'

import {keyDescription} from '../helper'

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

export const IDView = (props: {id: string; owner?: boolean}) => {
  const styl = {}
  if (props.owner) styl['fontWeight'] = 600
  // width: 520, wordWrap: 'break-word', wordBreak: 'break-all'
  return <Typography style={{...styles.mono, ...styl}}>{props.id}</Typography>
}

export const KeyDescriptionView = (props: {value: Key}) => {
  return <Typography>{keyDescription(props.value)}</Typography>
}

type Props = {
  value: Key
  add: () => void
  export: () => void
  remove: () => void
  removePublic: () => void
  revoke: () => void
  userSign: (service: string) => void
}

export default (props: Props) => {
  const key: Key = props.value
  const kid = key.id

  const saved = key.saved
  const user = key.user
  const signable = key.type == KeyType.EDX25519
  const isPrivate = key.type == KeyType.X25519 || key.type == KeyType.EDX25519
  const isPublic = key.type == KeyType.X25519_PUBLIC || key.type == KeyType.EDX25519_PUBLIC
  const add = !saved && isPublic
  const remove = saved && isPublic
  const removePrivate = isPrivate

  const [service, setService] = React.useState('github')

  return (
    <Box>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell style={{...cstyles.cell, width: 100}}>
              <Typography align="right">ID</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="column">
                <IDView id={kid} />
              </Box>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}>
              <Typography align="right">Type</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              <KeyDescriptionView value={key} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}>
              <Typography align="right">User</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              {(!isPrivate || !signable) && !user && <Typography style={{color: '#999'}}>none</Typography>}
              {user && (
                <Box
                  display="flex"
                  flexDirection="column"
                  key={'user-' + user.kid + '-' + user.seq}
                  paddingBottom={2}
                >
                  <UserLabel kid={user.kid} user={user} />
                  {user.err && <Typography style={{color: 'red'}}>{user.err}</Typography>}
                  <Link onClick={() => shell.openExternal(user.url)}>{user.url}</Link>
                  {isPrivate && (
                    <Box>
                      <Button size="small" color="secondary" onClick={props.revoke}>
                        Revoke
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
              {signable && !user && (
                <Box display="flex" flexDirection="row">
                  <ServiceSelect service={service} setService={setService} size="small" />
                  <Box marginRight={1} />
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => props.userSign(service)}
                  >
                    OK
                  </Button>
                </Box>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}></TableCell>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="row">
                {add && (
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={props.add}
                    style={{marginRight: 10}}
                  >
                    Add to Keys
                  </Button>
                )}
                {remove && (
                  <Button
                    size="small"
                    color="secondary"
                    variant="outlined"
                    onClick={props.removePublic}
                    style={{marginRight: 10}}
                  >
                    Remove from Keys
                  </Button>
                )}
                {isPrivate && (
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={props.export}
                    style={{marginRight: 10}}
                  >
                    Export
                  </Button>
                )}
                {removePrivate && (
                  <Button
                    size="small"
                    color="secondary"
                    variant="outlined"
                    onClick={props.remove}
                    style={{marginRight: 10}}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}
