import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'
import {Link} from '../../components'
import Dialog from '../../components/dialog'
import Snack, {SnackProps} from '../../components/snack'

import {authPasswordChange} from '../../rpc/keys'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [oldPassword, setOldPassword] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }
  const setError = (err: Error) => {
    openSnack({message: err.message, alert: 'error', duration: 6000})
  }

  const onInputChangeOldPassword = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setOldPassword(target.value || '')
  }, [])

  const onInputChangePassword = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPassword(target.value || '')
  }, [])

  const onInputChangePasswordConfirm = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPasswordConfirm(target.value || '')
  }, [])

  const changePassword = async () => {
    if (password != passwordConfirm) {
      setError(new Error("Passwords don't match"))
      return
    }
    if (password == '') {
      setError(new Error('Password is empty'))
      return
    }
    if (oldPassword == '') {
      setError(new Error('Old password is empty'))
      return
    }
    if (oldPassword == password) {
      setError(new Error('Passwords are the same'))
      return
    }

    setSnackOpen(false)
    try {
      await authPasswordChange({
        old: oldPassword,
        new: password,
      })
      props.close('Password changed.')
    } catch (err) {
      setError(err)
    }
  }

  return (
    <Dialog
      title="Change Password"
      open={props.open}
      close={{label: 'Close', action: props.close}}
      actions={[{label: 'Change', color: 'primary', action: changePassword}]}
      disabled={loading}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <TextField
          id="oldPasswordInput"
          autoFocus
          label="Old Password"
          variant="outlined"
          type="password"
          onChange={onInputChangeOldPassword}
          value={oldPassword}
          style={{width: 400}}
          disabled={loading}
        />
        <Box padding={1} />
        <TextField
          id="passwordInput"
          label="New Password"
          variant="outlined"
          type="password"
          onChange={onInputChangePassword}
          value={password}
          style={{width: 400}}
          disabled={loading}
        />
        <Box padding={1} />
        <TextField
          id="passwordConfirmInput"
          label="Confirm New Password"
          variant="outlined"
          type="password"
          onChange={onInputChangePasswordConfirm}
          value={passwordConfirm}
          style={{width: 400}}
          disabled={loading}
        />
        <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
      </Box>
    </Dialog>
  )
}
