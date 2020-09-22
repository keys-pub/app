import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from '../../header'
import Logo from '../../logo'
import {Link} from '../../../components'

import {authUnlock} from '../../../rpc/keys'
import {AuthType} from '../../../rpc/keys.d'
import AuthForgotView from './forgot'

import {store, unlocked} from '../../store'
import ActionsView, {Action} from './actions'

type Props = {
  actions?: Action[]
}

export default (props: Props) => {
  const [input, setInput] = React.useState('')
  const [error, setError] = React.useState<Error>()
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>()
  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setInput(target.value)
    setError(undefined)
  }, [])

  const onUnlock = async () => {
    if (!input) {
      setError(new Error('Oops, password is empty'))
      inputRef.current?.focus()
      return
    }

    // Have progress indicator come after a little delay, usually it's very fast
    // and we don't want show the loading indicator just for a split second.
    const timeout = setTimeout(() => {
      setProgress(true)
    }, 2000)

    setLoading(true)
    setError(undefined)

    try {
      const resp = await authUnlock({
        secret: input,
        type: AuthType.PASSWORD_AUTH,
        client: 'app',
      })
      clearTimeout(timeout)
      await unlocked(resp.authToken)
      // setLoading(false)
      // setProgress(false)
    } catch (err) {
      clearTimeout(timeout)
      setLoading(false)
      setProgress(false)
      setError(err)
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
      <Header noLock noBack />
      <Logo loading={progress} top={60} />
      <Typography style={{paddingTop: 10, paddingBottom: 20}}>Enter your password to unlock.</Typography>
      <FormControl error={!!error} style={{marginBottom: 10}}>
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
          style={{fontSize: 48, width: 400}}
          disabled={loading}
        />
        <FormHelperText>{error?.message || ' '}</FormHelperText>
      </FormControl>
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
