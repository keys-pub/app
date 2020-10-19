import * as React from 'react'

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core'

import Header from '../header'
import Logo from '../logo'
import {mono} from '../theme'
import {ipcRenderer} from 'electron'

import {keys} from '../rpc/client'
import {Encoding} from '@keys-pub/tsclient/lib/keys.d'
import {openSnackError, closeSnack} from '../snack'

type Props = {
  close: () => void
}

export default (props: Props) => {
  const [loading, setLoading] = React.useState(false)
  const [confirm, setConfirm] = React.useState('')

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setConfirm(target.value)
  }, [])

  const onAuthReset = React.useCallback(async () => {
    if (confirm != 'ok reset') {
      openSnackError(new Error('Type ok reset to confirm'))
      return
    }
    setLoading(true)
    closeSnack()
    try {
      const status = await keys.RuntimeStatus({})
      const resp = await keys.AuthReset({appName: status.appName})
      setLoading(false)
      props.close()
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }, [confirm])

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
      <Header noBack />
      <Logo top={100} />
      <Typography style={{paddingTop: 0, width: 550, textAlign: 'center'}} paragraph>
        Are you sure you want to reset auth? <br />
        <span style={{fontWeight: 600}}>
          This will remove your vault including your keys and secrets and start over.
        </span>
      </Typography>
      <Typography style={{paddingTop: 0, width: 550, textAlign: 'center'}} paragraph>
        Type{' '}
        <span
          style={{
            ...mono,
            backgroundColor: 'black',
            color: 'white',
            paddingLeft: 4,
            paddingTop: 2,
            paddingBottom: 2,
            paddingRight: 4,
          }}
        >
          ok reset
        </span>{' '}
        to confirm:
      </Typography>
      <FormControl>
        <TextField
          autoFocus
          placeholder="ok reset"
          variant="outlined"
          onChange={onInputChange}
          value={confirm}
          disabled={loading}
          InputProps={{
            style: {...mono, width: 450},
          }}
        />
      </FormControl>
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
        <Box display="flex" flexDirection="row" style={{width: 450, paddingTop: 10}}>
          <Button color="secondary" variant="outlined" onClick={props.close} disabled={loading}>
            Cancel
          </Button>
          <Box flex={1} flexGrow={1} />
          <Button color="primary" variant="outlined" onClick={onAuthReset} disabled={loading}>
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
