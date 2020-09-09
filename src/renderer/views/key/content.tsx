import * as React from 'react'
import {CSSProperties} from 'react'

import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {Skeleton} from '@material-ui/lab'

import {shell} from 'electron'

import {Key, KeyType, User} from '../../rpc/keys.d'
import ServiceSelect from '../user/service'
import {styles, Link} from '../../components'
import Snack, {SnackProps} from '../../components/snack'
import UserLabel from '../user/label'

import {keyDescription, dateString} from '../helper'

export const IDView = (props: {id: string; owner?: boolean}) => {
  const style: CSSProperties = {}
  if (props.owner) style.fontWeight = 600
  // width: 520, wordWrap: 'break-word', wordBreak: 'break-all'
  return <Typography style={{...styles.mono, ...style}}>{props.id}</Typography>
}

export const KeyDescriptionView = (props: {value: Key}) => {
  return <Typography>{keyDescription(props.value)}</Typography>
}

type UserProps = {
  k: Key
  revoke: () => void
  userSign: (service: string) => void
  update: () => void
  openURL: (url: string) => void
}

export const UserRow = (props: UserProps) => {
  const key = props.k
  const user = key.user
  const signable = key.type == KeyType.EDX25519
  const isPrivate = key.type == KeyType.X25519 || key.type == KeyType.EDX25519

  const [service, setService] = React.useState('github')

  if (user) {
    return (
      <TableRow>
        <TableCell style={{...cstyles.cell}}>
          <Typography align="right">User</Typography>
        </TableCell>
        <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
          <Box display="flex" flexDirection="column" key={'user-' + user.kid + '-' + user.seq}>
            <Box display="flex" flexDirection="row">
              <UserLabel user={user} />
              <Box style={{marginLeft: 10}} />
              {isPrivate && (
                <Link color="secondary" style={{marginTop: -1}} onClick={props.revoke}>
                  [revoke]
                </Link>
              )}
            </Box>
            {user.err && <Typography style={{color: 'red'}}>{user.err}</Typography>}
            <Link
              onClick={() => props.openURL(user.url!)}
              style={{maxWidth: 480, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}
            >
              {user.url}
            </Link>
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  if (signable && !user) {
    return (
      <TableRow>
        <TableCell style={{...cstyles.cell, paddingTop: 6}}>
          <Typography align="right">User</Typography>
        </TableCell>
        <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
          <Box display="flex" flexDirection="row">
            <ServiceSelect service={service} setService={setService} small />
            <Box marginRight={1} />
            <Button variant="outlined" size="small" color="primary" onClick={() => props.userSign(service)}>
              OK
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  if ((!isPrivate || !signable) && !user) {
    return (
      <TableRow>
        <TableCell style={{...cstyles.cell}}>
          <Typography align="right">User</Typography>
        </TableCell>
        <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
          <Typography style={{color: '#999'}}>none</Typography>
        </TableCell>
      </TableRow>
    )
  }

  return null
}

type Props = {
  k: Key
  revoke: () => void
  userSign: (service: string) => void
  update: () => void
}

export default (props: Props) => {
  const key: Key = props.k
  const kid = key.id!
  const sigchainURL = 'https://keys.pub/sigchain/' + key.id

  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const openURL = async (url: string) => {
    try {
      await shell.openExternal(url)
    } catch (err) {
      setSnack({message: err.message, duration: 4000, alert: 'error'})
      setSnackOpen(true)
    }
  }

  const openSigchain = () => openURL(sigchainURL)
  const verifiedAt = dateString(key.user?.verifiedAt)

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
          <UserRow {...props} openURL={openURL} />
          {verifiedAt != '' && (
            <TableRow>
              <TableCell style={{...cstyles.cell, paddingBottom: 6, verticalAlign: 'center'}}>
                <Typography align="right">Verified</Typography>
              </TableCell>
              <TableCell style={{...cstyles.cell, paddingBottom: 4}}>
                <Typography>
                  {verifiedAt}&nbsp;&nbsp;
                  <Link span color="primary" onClick={props.update}>
                    Update
                  </Link>
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {verifiedAt == '' && (
            <TableRow>
              <TableCell style={{...cstyles.cell}}></TableCell>
              <TableCell style={{...cstyles.cell, paddingBottom: 10}}>
                <Button size="small" variant="outlined" onClick={props.update}>
                  Update
                </Button>
              </TableCell>
            </TableRow>
          )}
          {(key?.sigchainLength || 0) > 0 && (
            <TableRow>
              <TableCell style={{...cstyles.cell}}>
                <Typography align="right">Sigchain</Typography>
              </TableCell>
              <TableCell style={{...cstyles.cell}}>
                <Typography>
                  <Link span onClick={openSigchain}>
                    View {key.sigchainLength} {key.sigchainLength == 1 ? 'entry' : 'entries'}
                  </Link>
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 16,
    paddingBottom: 0,
    verticalAlign: 'top',
  },
}
