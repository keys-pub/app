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

import {keys} from '../rpc/client'
import {AuthType} from '@keys-pub/tsclient/lib/keys.d'

import {store, unlocked} from '../store'
import {openSnack, openSnackError, closeSnack} from '../snack'

type Props = {
  close: () => void
}

export default (props: Props) => {
  const [loading, setLoading] = React.useState(false)
  const [paperKey, setPaperKey] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')

  const onInputChangePhrase = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPaperKey(target.value)
  }, [])

  const onInputChangeNewPassword = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setNewPassword(target.value)
  }, [])

  const onAuthRecover = React.useCallback(async () => {
    setLoading(true)
    closeSnack()
    try {
      const resp = await keys.AuthRecover({
        paperKey,
        newPassword,
      })
      await unlocked(resp.authToken)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }, [paperKey, newPassword])

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
      <Header noBack />
      <Logo top={100} />
      <Typography style={{paddingTop: 0, width: 550, textAlign: 'center'}} paragraph>
        Enter in your paper key and a new password.
      </Typography>
      <FormControl>
        <TextField
          autoFocus
          label="Paper Key"
          variant="outlined"
          onChange={onInputChangePhrase}
          value={paperKey}
          multiline
          rows={4}
          disabled={loading}
          InputProps={{
            style: {...mono, width: 450},
          }}
        />
      </FormControl>
      <FormControl style={{marginTop: 10}}>
        <TextField
          label="New Password"
          variant="outlined"
          onChange={onInputChangeNewPassword}
          type="password"
          value={newPassword}
          disabled={loading}
          InputProps={{
            style: {...mono, width: 450},
          }}
        />
      </FormControl>
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
        <Box display="flex" flexDirection="row" style={{width: 450, paddingTop: 20}}>
          <Button color="secondary" variant="outlined" onClick={props.close} disabled={loading}>
            Cancel
          </Button>
          <Box flex={1} flexGrow={1} />
          <Button color="primary" variant="outlined" onClick={onAuthRecover} disabled={loading}>
            Recover
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
