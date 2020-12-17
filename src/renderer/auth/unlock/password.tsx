import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from '../../header'
import Logo from '../../logo'
import Link from '../../components/link'

import {keys} from '../../rpc/client'
import {AuthType} from '@keys-pub/tsclient/lib/keys'

import {store, unlock} from '../../store'
import {openSnackError, closeSnack} from '../../snack'
import ActionsView, {Action} from './actions'

type Props = {
  actions?: Action[]
}

export default (props: Props) => {
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>()
  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setInput(target.value)
    closeSnack()
  }, [])

  const onUnlock = async () => {
    if (!input) {
      openSnackError(new Error('Empty password'))
      inputRef.current?.focus()
      return
    }

    // Have progress indicator come after a little delay, usually it's very fast
    // and we don't want show the loading indicator just for a split second.
    const timeout = setTimeout(() => {
      setProgress(true)
    }, 2000)

    setLoading(true)
    closeSnack()

    try {
      const resp = await keys.authUnlock({
        secret: input,
        type: AuthType.PASSWORD_AUTH,
        client: 'app',
      })
      clearTimeout(timeout)
      await unlock(resp.authToken)
      // setLoading(false)
      // setProgress(false)
    } catch (err) {
      clearTimeout(timeout)
      setLoading(false)
      setProgress(false)
      openSnackError(err)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      onUnlock()
    }
  }

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
      <Header noBack />
      <Logo loading={progress} top={100} />
      <Typography style={{paddingTop: 10, paddingBottom: 20}}>Enter your password to unlock.</Typography>
      <TextField
        id="unlockPasswordInput"
        autoFocus
        label="Password"
        variant="outlined"
        type="password"
        onChange={onInputChange}
        inputProps={{
          ref: inputRef,
          style: {fontSize: 32, height: 18},
          onKeyDown: onKeyDown,
        }}
        value={input}
        style={{fontSize: 48, width: 400, marginBottom: 20}}
        disabled={loading}
      />
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
        <Button
          color="primary"
          variant="outlined"
          size="large"
          onClick={onUnlock}
          disabled={loading}
          id="unlockButton"
        >
          Unlock
        </Button>
      </Box>
      <ActionsView actions={props.actions} />
    </Box>
  )
}
