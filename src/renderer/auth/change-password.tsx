import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'
import Link from '../components/link'
import Dialog from '../components/dialog'

import {rpc} from '../rpc/client'
import {openSnack, openSnackError, closeSnack} from '../snack'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [oldPassword, setOldPassword] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

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
      openSnackError(new Error("Passwords don't match"))
      return
    }
    if (password == '') {
      openSnackError(new Error('Password is empty'))
      return
    }
    if (oldPassword == '') {
      openSnackError(new Error('Old password is empty'))
      return
    }
    if (oldPassword == password) {
      openSnackError(new Error('Passwords are the same'))
      return
    }

    setLoading(true)
    closeSnack()
    try {
      await rpc.authPasswordChange({
        old: oldPassword,
        new: password,
      })
      setLoading(false)
      props.close('Password changed')
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  return (
    <Dialog
      title="Change Password"
      open={props.open}
      close={{label: 'Close', action: () => props.close()}}
      actions={[{label: 'Change', color: 'primary', action: changePassword}]}
      loading={loading}
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
      </Box>
    </Dialog>
  )
}
