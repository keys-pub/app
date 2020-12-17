import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@material-ui/core'

import Dialog from '../components/dialog'
import {AddIcon, RefreshIcon} from '../icons'
import {breakWords} from '../theme'

import {Store} from 'pullstate'
import {openSnack, openSnackError} from '../snack'

import {keys} from '../rpc/client'
import {RPCError, ClientReadableStream} from '@keys-pub/tsclient'
import {Channel, User, UserStatus} from '@keys-pub/tsclient/lib/keys'
// import {ChannelInvite} from '@keys-pub/tsclient/lib/keys'

type Props = {
  user: User
  open: boolean
  close: (snack?: string) => void
  joined: (snack: string) => void
}

type State = {
  invites: ChannelInvite[]
}

const initialState: State = {
  invites: [],
}

export const store = new Store(initialState)

// const refresh = async (user: User) => {
//   try {
//     const resp = await keys.channelUserInvites({
//       user: user.kid!,
//     })
//     store.update((s) => {
//       s.invites = resp.invites || []
//     })
//   } catch (err) {
//     openSnackError(err)
//   }
// }

type ChannelInvite = {
  channel: Channel
}

export default (props: Props) => {
  const {invites} = store.useState()
  const [loading, setLoading] = React.useState(false)

  // React.useEffect(() => {
  //   refresh(props.user)
  // }, [props.user])

  const join = async (channel: Channel) => {
    // try {
    //   setLoading(true)
    //   const resp = await keys.channelJoin({
    //     channel: channel.id,
    //     user: props.user.kid,
    //   })
    //   refresh(props.user)
    //   setLoading(false)
    //   props.joined('Joined #' + channel.name + '.')
    // } catch (err) {
    //   setLoading(false)
    //   openSnackError(err)
    // }
  }

  return (
    <Dialog open={props.open} title="Invites" close={{label: 'Close', action: () => props.close()}}>
      <Box display="flex" flexDirection="column">
        {invites.length == 0 && <Typography>No invites.</Typography>}
        <Table size="small">
          <TableBody>
            {invites.map((invite: ChannelInvite, index: number) => {
              console.log('invite:', invite)
              return (
                <TableRow key={'ch-' + invite.channel!.id!}>
                  <TableCell component="th" scope="row" style={{verticalAlign: 'top'}}>
                    <Box display="flex" flexDirection="row">
                      <Box display="flex" flexDirection="column" paddingRight={1}>
                        <Typography style={{fontSize: '1.05em', fontWeight: 500}}>
                          #{invite.channel?.name}
                        </Typography>
                        <Typography variant="body2" style={{...breakWords, fontSize: '0.85em'}}>
                          {invite.channel?.id}
                        </Typography>
                      </Box>
                      <Box display="flex" flexDirection="row">
                        <Box>
                          <Button
                            size="small"
                            color="primary"
                            variant="outlined"
                            onClick={() => join(invite.channel!)}
                            disabled={loading}
                          >
                            Join
                          </Button>
                        </Box>
                        <Box padding={1} />
                        <Box>
                          <Button
                            size="small"
                            color="secondary"
                            variant="outlined"
                            disabled={loading}
                            onClick={() => {}}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>
    </Dialog>
  )
}
