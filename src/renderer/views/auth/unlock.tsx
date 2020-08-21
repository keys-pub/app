import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from '../header'
import Logo from '../logo'

import {ipcRenderer} from 'electron'

import {authUnlock} from '../../rpc/keys'
import {AuthUnlockRequest, AuthUnlockResponse, AuthType} from '../../rpc/keys.d'
import {useLocation} from 'wouter'

import {store} from '../../store'

export default (_: {}) => {
  const [location, setLocation] = useLocation()
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

  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      unlock()
    }
  }

  const unlock = async () => {
    if (!input) {
      setError(new Error('Oops, password is empty'))
      inputRef?.current?.focus()
      return
    }

    // Have progress indicator come after a little delay, usually it's very fast
    // and we don't want show the loading indicator just for a split second.
    const timeout = setTimeout(() => {
      setProgress(true)
    }, 2000)

    setLoading(true)
    setError(undefined)

    // TODO: Use config app name for client name
    const req: AuthUnlockRequest = {
      secret: input,
      type: AuthType.PASSWORD_AUTH,
      client: 'app',
    }
    console.log('Auth unlock')

    try {
      const resp = await authUnlock(req)
      console.log('Auth unlocking...')
      ipcRenderer.send('authToken', {authToken: resp.authToken})

      clearTimeout(timeout)
      setLoading(false)
      setProgress(false)
      store.update((s) => {
        s.unlocked = true
        setLocation('/keys/index')
      })
    } catch (err) {
      clearTimeout(timeout)
      setLoading(false)
      setProgress(false)
      setError(err)
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
        <FormHelperText id="component-error-text">{error?.message || ' '}</FormHelperText>
      </FormControl>
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
        <Button
          color="primary"
          variant="outlined"
          size="large"
          onClick={unlock}
          disabled={loading}
          id="unlockButton"
        >
          Unlock
        </Button>
      </Box>
    </Box>
  )
}
