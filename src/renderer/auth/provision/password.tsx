import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'
import {Link} from '../../components'
import Dialog from '../../components/dialog'

import {keys} from '../../rpc/client'
import {AuthType} from '@keys-pub/tsclient/lib/keys.d'
import {openSnackError} from '../../snack'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const inputPasswordConfirmRef = React.useRef<HTMLInputElement>()

  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onInputChangePassword = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPassword(target.value || '')
  }, [])

  const onInputChangePasswordConfirm = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPasswordConfirm(target.value || '')
  }, [])

  const onAuthProvision = async () => {
    if (password != passwordConfirm) {
      openSnackError(new Error("Passwords don't match"))
      return
    }
    if (password == '') {
      openSnackError(new Error('Oops, password is empty'))
      return
    }

    setLoading(true)
    try {
      const resp = await keys.AuthProvision({
        secret: password,
        type: AuthType.PASSWORD_AUTH,
      })
      setPassword('')
      setPasswordConfirm('')
      setLoading(false)
      props.close('Password saved.')
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  const onKeyDownPassword = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      inputPasswordConfirmRef.current?.focus()
    }
  }
  const onKeyDownPasswordConfirm = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      onAuthProvision()
    }
  }

  return (
    <Dialog
      open={props.open}
      title="Password"
      close={{label: 'Close', action: () => props.close()}}
      actions={[{label: 'Provision', color: 'primary', action: () => onAuthProvision()}]}
    >
      <Box display="flex" flex={1} flexDirection="column" alignItems="center" style={{width: '100%'}}>
        <FormControl style={{width: 400}}>
          <TextField
            id="setupPasswordInput"
            autoFocus
            label="Password"
            variant="outlined"
            type="password"
            onChange={onInputChangePassword}
            inputProps={{
              onKeyDown: onKeyDownPassword,
            }}
            value={password}
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
            }}
            value={passwordConfirm}
            disabled={loading}
            inputRef={inputPasswordConfirmRef}
          />
        </FormControl>
      </Box>
    </Dialog>
  )
}
