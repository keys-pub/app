import * as React from 'react'

import {
  Box,
  Button,
  IconButton,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'
import {CopyIcon} from '../icons'

import {KeyLabel} from '../key/label'
import {clipboard} from 'electron'

import {Key, ExportType, KeyExportRequest, KeyExportResponse} from '@keys-pub/tsclient/lib/keys'
import Snack, {SnackProps} from '../components/snack'

import AutocompletesView from '../keys/autocompletes'
import Dialog from '../components/dialog'

import {keys} from '../rpc/client'
import {Store} from 'pullstate'
import {openSnack, openSnackError} from '../snack'

type Props = {
  channel: string
  inbox: string
  open: boolean
  close: () => void
}

type State = {
  recipients: Key[]
}
const initialState: State = {
  recipients: [],
}
export const store = new Store(initialState)

export default (props: Props) => {
  const {recipients} = store.useState()

  const channelInvite = async () => {
    // try {
    //   const rids = recipients.map((k: Key) => k.id!)
    //   const resp = await keys.channelInvitesCreate({
    //     channel: props.channel,
    //     sender: props.inbox,
    //     recipients: rids,
    //   })
    // } catch (err) {
    //   openSnackError(err)
    // }
  }

  return (
    <Dialog
      open={props.open}
      title="Invite to Channel"
      close={{label: 'Cancel', action: () => props.close()}}
      actions={[{label: 'Invite', color: 'primary', action: () => channelInvite()}]}
    >
      <Box display="flex" flex={1} flexDirection="column" style={{width: '100%'}}>
        <AutocompletesView
          keys={recipients}
          onChange={(recipients: Key[]) =>
            store.update((s) => {
              s.recipients = recipients
            })
          }
          id="channelMembersAutocomplete"
          placeholder="Invite Members"
          searchOption
          importOption
          variant="outlined"
        />
      </Box>
    </Dialog>
  )
}
