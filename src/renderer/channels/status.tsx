import * as React from 'react'

import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@material-ui/core'

import UserLabel from '../user/label'

import {CloseIcon, InfoIcon} from '../icons'
import {breakWords} from '../theme'

import {keys} from '../rpc/client'
import {Key, User} from '@keys-pub/tsclient/lib/keys'

import {Theme, withStyles, createStyles} from '@material-ui/core/styles'

export enum ConnectStatus {
  Disconnected = 0,
  Connecting = 1,
  Connected = 2,
}

type Props = {
  user?: User
  connectStatus: ConnectStatus
  connect: () => void
  disconnect: () => void
  selectUser: (user: User) => void
  openInvites: () => void
}

const connectStatus = (status: ConnectStatus): string => {
  switch (status) {
    case ConnectStatus.Disconnected:
      return 'Disconnected'
    case ConnectStatus.Connecting:
      return 'Connecting...'
    case ConnectStatus.Connected:
      return 'Connected'
    default:
      return 'Unknown'
  }
}

export default (props: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [users, setUsers] = React.useState<User[]>([])

  const setOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const close = () => {
    setAnchorEl(null)
  }

  React.useEffect(() => {
    const fn = async () => {
      const resp = await keys.keys({})
      const users = resp.keys?.filter((k: Key) => k.isPrivate && !!k.user).map((k: Key) => k.user!) || []
      setUsers(users as User[])
      if (!props.user && users.length > 0) {
        props.selectUser(users[0])
      }
    }
    fn()
  }, [])

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{
        height: 40,
      }}
    >
      <ButtonBase focusRipple aria-haspopup="true" onClick={setOpen}>
        <Box display="flex" flexDirection="column" paddingTop={1} paddingBottom={1}>
          <Box display="flex" flexDirection="row">
            {props.user && <UserLabel user={props.user} />}
            {/* <Typography>{connectStatus(props.connectStatus)}</Typography> */}
            {props.connectStatus == ConnectStatus.Disconnected && (
              <Box paddingLeft={2}>
                <Typography>{connectStatus(props.connectStatus)}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </ButtonBase>

      <Popover
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={close}
      >
        <Box display="flex" flexDirection="column" flex={1} style={{width: 270}}>
          {users.map((user: User) => (
            <ButtonBase
              focusRipple
              aria-haspopup="true"
              onClick={() => {
                props.selectUser(user)
                close()
              }}
              style={{padding: 10}}
            >
              <UserLabel user={user} />
            </ButtonBase>
          ))}

          {props.user && (
            <Button
              color="primary"
              fullWidth
              onClick={() => {
                close()
                props.openInvites()
              }}
            >
              Invites
            </Button>
          )}

          {props.connectStatus == ConnectStatus.Connected && (
            <Button
              color="secondary"
              fullWidth
              onClick={() => {
                close()
                props.disconnect()
              }}
            >
              Disconnect
            </Button>
          )}
          {props.user && props.connectStatus == ConnectStatus.Disconnected && (
            <Button
              color="primary"
              fullWidth
              onClick={() => {
                close()
                props.connect()
              }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Popover>
    </Box>
  )
}
