import * as React from 'react'

import {
  Box,
  Button,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'
import {CopyIcon} from '../icons'

import {KeyLabel} from '../key/label'
import {clipboard, shell} from 'electron'

import {Key, ExportType, KeyExportRequest, KeyExportResponse} from '@keys-pub/tsclient/lib/keys'
import Snack, {SnackProps} from '../components/snack'

import Dialog from '../components/dialog'
import Link from '../components/link'

import {keys} from '../rpc/client'
import {User} from '@keys-pub/tsclient/lib/keys'

import {Store} from 'pullstate'
import {openSnack, openSnackError} from '../snack'

type Props = {
  user: User
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [name, setName] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onInputChangeName = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setName(target.value || '')
  }, [])

  const onInputChangeDesc = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setDesc(target.value || '')
  }, [])

  const channelCreate = async () => {
    try {
      setLoading(true)
      const resp = await keys.channelCreate({
        name: name,
        user: props.user.kid,
      })
      setLoading(false)
      props.close('Channel created.')
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  return (
    <Dialog
      open={props.open}
      title="Create a Channel"
      close={{label: 'Cancel', action: () => props.close()}}
      actions={[{label: 'Create', color: 'primary', action: () => channelCreate()}]}
      loading={loading}
    >
      <Box display="flex" flex={1} flexDirection="column" style={{width: '100%'}}>
        <TextField
          autoFocus
          label="Channel Name"
          fullWidth
          variant="outlined"
          placeholder="memes"
          onChange={onInputChangeName}
          value={name}
          InputProps={{
            startAdornment: <InputAdornment position="start">#</InputAdornment>,
          }}
          inputProps={{
            spellCheck: false,
          }}
        />
        <Box height={10} />
        <Typography paragraph>
          For more details about how channel information is encrypted see{' '}
          <Link inline onClick={() => shell.openExternal('https://keys.pub/docs/specs/channel.html')}>
            keys.pub/docs/specs/channel
          </Link>
          .
        </Typography>
        {/* <TextField
          autoFocus
          label="Description (optional)"
          fullWidth
          variant="outlined"
          onChange={onInputChangeDesc}
          value={desc}
          inputProps={{
            spellCheck: false,
          }}
        />
        <Box height={20} /> */}
      </Box>
    </Dialog>
  )
}
