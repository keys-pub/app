import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import {authSetup, authUnlock} from '../../../rpc/keys'
import {
  AuthSetupRequest,
  AuthSetupResponse,
  AuthUnlockRequest,
  AuthUnlockResponse,
  AuthType,
} from '../../../rpc/keys.d'
import {ipcRenderer} from 'electron'

import {useLocation} from 'wouter'
import {store} from '../../../store'

type Props = {}

export default (props: Props) => {
  // const inputPasswordRef = React.useRef<HTMLInputElement>()
  const inputPasswordConfirmRef = React.useRef<HTMLInputElement>()

  const [location, setLocation] = useLocation()
  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [error, setError] = React.useState<Error>()
  const [loading, setLoading] = React.useState(false)

  const onInputChangePassword = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPassword(target.value || '')
  }, [])

  const onInputChangePasswordConfirm = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPasswordConfirm(target.value || '')
  }, [])

  const authSetPassword = async () => {
    if (password != passwordConfirm) {
      setError(new Error("Passwords don't match"))
      return
    }
    if (password == '') {
      setError(new Error('Oops, password is empty'))
      return
    }

    setLoading(true)
    setError(undefined)
    try {
      const req: AuthSetupRequest = {
        secret: password,
        type: AuthType.PASSWORD_AUTH,
      }
      const setup: AuthSetupResponse = await authSetup(req)
      const reqUnlock: AuthUnlockRequest = {
        secret: password,
        type: AuthType.PASSWORD_AUTH,
        client: 'app',
      }
      const unlock: AuthUnlockResponse = await authUnlock(reqUnlock)
      ipcRenderer.send('authToken', {authToken: unlock.authToken})
      setLoading(false)
      setLocation('/keys/index')
      store.update((s) => {
        s.unlocked = true
      })
    } catch (err) {
      setLoading(false)
      setError(err)
    }
  }

  const onKeyDownPassword = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      inputPasswordConfirmRef.current?.focus()
    }
  }
  const onKeyDownPasswordConfirm = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      authSetPassword()
    }
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography style={{paddingTop: 0, paddingBottom: 20, width: 550, textAlign: 'center'}}>
        Hi! Let's create a password. This password will be used to encrypt your keys and secrets and will be
        required to unlock your vault.
      </Typography>
      <FormControl error={!!error}>
        <TextField
          id="setupPasswordInput"
          autoFocus
          label="Create a Password"
          variant="outlined"
          type="password"
          onChange={onInputChangePassword}
          inputProps={{
            onKeyDown: onKeyDownPassword,
            style: {fontSize: 32, height: 18},
          }}
          value={password}
          style={{fontSize: 48, width: 400}}
          disabled={loading}
        />
        <Box padding={1} />
        <TextField
          id="setupPasswordConfirmInput"
          label="Confirm Password"
          variant="outlined"
          type="password"
          onChange={onInputChangePasswordConfirm}
          inputProps={{
            onKeyDown: onKeyDownPasswordConfirm,
            style: {fontSize: 32, height: 18},
          }}
          value={passwordConfirm}
          style={{fontSize: 48, width: 400}}
          disabled={loading}
          inputRef={inputPasswordConfirmRef}
        />
        <FormHelperText>{error?.message || ' '}</FormHelperText>
      </FormControl>
      <Box display="flex" flexDirection="row" justifyContent="center" style={{width: 400}}>
        <Button
          color="primary"
          variant="outlined"
          onClick={authSetPassword}
          disabled={loading}
          id="setupPasswordButton"
        >
          Set Password
        </Button>
      </Box>
    </Box>
  )
}
