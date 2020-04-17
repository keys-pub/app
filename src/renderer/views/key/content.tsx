import * as React from 'react'

import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {Skeleton} from '@material-ui/lab'

import {CSSProperties} from '@material-ui/styles'
import {shell} from 'electron'

import {Key, KeyType, User} from '../../rpc/types'
import ServiceSelect from '../user/service'
import {styles, Link} from '../../components'
import UserLabel from '../user/label'

import {keyDescription, dateString} from '../helper'

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 16,
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
  revoke: () => void
  userSign: (service: string) => void
}

const UserView = (props: Props) => {
  const key = props.value
  const user = key.user
  const signable = key.type == KeyType.EDX25519
  const isPrivate = key.type == KeyType.X25519 || key.type == KeyType.EDX25519

  const [service, setService] = React.useState('github')

  return (
    <Box>
      {(!isPrivate || !signable) && !user && <Typography style={{color: '#999'}}>none</Typography>}
      {user && (
        <Box display="flex" flexDirection="column" key={'user-' + user.kid + '-' + user.seq}>
          <Box display="flex" flexDirection="row">
            <UserLabel kid={user.kid} user={user} />
            <Box style={{marginLeft: 10}} />
            {isPrivate && (
              <Link color="secondary" style={{marginTop: -1}} onClick={props.revoke}>
                [revoke]
              </Link>
            )}
          </Box>
          {user.err && <Typography style={{color: 'red'}}>{user.err}</Typography>}
          <Link onClick={() => shell.openExternal(user.url)}>{user.url}</Link>
        </Box>
      )}
      {signable && !user && (
        <Box display="flex" flexDirection="row">
          <ServiceSelect service={service} setService={setService} size="small" />
          <Box marginRight={1} />
          <Button variant="outlined" size="small" color="primary" onClick={() => props.userSign(service)}>
            OK
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default (props: Props) => {
  const key: Key = props.value
  const kid = key.id

  const sigchainURL = 'https://keys.pub/sigchain/' + key.id
  const openSigchain = () => shell.openExternal(sigchainURL)

  return (
    <Box>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell style={{...cstyles.cell, width: 30}}>
              <Typography align="right">ID</Typography>
            </TableCell>
            <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
              <Box display="flex" flexDirection="column">
                <IDView id={kid} />
              </Box>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{...cstyles.cell}}>
              <Typography align="right">Type</Typography>
            </TableCell>
            <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
              <KeyDescriptionView value={key} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{...cstyles.cell}}>
              <Typography align="right">User</Typography>
            </TableCell>
            <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
              <UserView {...props} />
            </TableCell>
          </TableRow>
          {key.user && (
            <TableRow>
              <TableCell style={{...cstyles.cell}}>
                <Typography align="right">Verified</Typography>
              </TableCell>
              <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
                <Typography>{dateString(key.user.verifiedAt) || '-'}</Typography>
              </TableCell>
            </TableRow>
          )}
          {key.sigchainLength > 0 && (
            <TableRow>
              <TableCell style={{...cstyles.cell}}>
                <Typography align="right">Sigchain</Typography>
              </TableCell>
              <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
                <Typography>
                  <Link span onClick={openSigchain}>
                    View {key.sigchainLength} {key.sigchainLength == 1 ? 'entry' : 'entries'}
                  </Link>
                  {/* &nbsp;&nbsp;(Updated {dateString(key.sigchainUpdatedAt)}) */}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}
