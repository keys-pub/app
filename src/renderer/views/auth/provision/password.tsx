import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'
import {Link} from '../../../components'
import Dialog from '../../../components/dialog'

import {authProvision} from '../../../rpc/keys'
import {AuthType} from '../../../rpc/keys.d'
import Snack, {SnackProps} from '../../../components/snack'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const inputPasswordConfirmRef = React.useRef<HTMLInputElement>()

  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

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
      openSnack({message: "Passwords don't match", duration: 6000, alert: 'error'})
      return
    }
    if (password == '') {
      openSnack({message: 'Oops, password is empty', duration: 6000, alert: 'error'})
      return
    }

    setLoading(true)
    try {
      const resp = await authProvision({
        secret: password,
        type: AuthType.PASSWORD_AUTH,
      })
      props.close('Password saved.')
    } catch (err) {
      setLoading(false)
      openSnack({message: err.message, duration: 6000, alert: 'error'})
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
      close={{label: 'Cancel', color: 'secondary', action: () => props.close()}}
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
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Dialog>
  )
}
