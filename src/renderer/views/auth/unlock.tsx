import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from '../header'
import Logo from '../logo'

import {ipcRenderer} from 'electron'

import {authUnlock} from '../../rpc/keys'
import {AuthUnlockRequest, AuthUnlockResponse, AuthType} from '../../rpc/keys.d'
import {useLocation} from 'wouter'

import {store} from '../../store'

type Props = {
  unlock: () => void
}

type State = {
  password: string
  loading: boolean
  progress: boolean
  error?: Error
}

class AuthUnlockView extends React.Component<Props, State> {
  state: State = {
    password: '',
    loading: false,
    progress: false,
  }
  private inputRef = React.createRef<HTMLInputElement>()

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: undefined})
  }

  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Header noLock noBack />
        <Logo loading={this.state.progress} top={60} />
        <Typography style={{paddingTop: 10, paddingBottom: 20}}>Enter your password to unlock.</Typography>
        <FormControl error={!!this.state.error} style={{marginBottom: 10}}>
          <TextField
            autoFocus
            label="Password"
            variant="outlined"
            type="password"
            onChange={this.onInputChange}
            inputProps={{
              ref: this.inputRef,
              style: {fontSize: 32, height: 18},
              onKeyDown: this.onKeyDown,
            }}
            value={this.state.password}
            style={{fontSize: 48, width: 400}}
            disabled={this.state.loading}
          />
          <FormHelperText id="component-error-text">{this.state.error?.message || ' '}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          <Button
            color="primary"
            variant="outlined"
            size="large"
            onClick={this.unlock}
            disabled={this.state.loading}
          >
            Unlock
          </Button>
        </Box>
      </Box>
    )
  }

  onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      this.unlock()
    }
  }

  unlock = async () => {
    const password = this.state.password
    if (!password) {
      this.setState({
        error: new Error('Oops, password is empty'),
      })
      this.inputRef?.current?.focus()
      return
    }

    // Have progress indicator come after a little delay, usually it's very fast
    // and we don't want show the loading indicator just for a split second.
    const timeout = setTimeout(() => {
      this.setState({progress: true})
    }, 2000)

    this.setState({loading: true, error: undefined})
    // TODO: Use config app name for client name
    const req: AuthUnlockRequest = {
      secret: this.state.password,
      type: AuthType.PASSWORD_AUTH,
      client: 'app',
    }
    console.log('Auth unlock')
    try {
      const resp = await authUnlock(req)
      console.log('Auth unlocking...')
      ipcRenderer.send('authToken', {authToken: resp.authToken})
      this.props.unlock()
    } catch (err) {
      this.setState({error: err})
    } finally {
      clearTimeout(timeout)
      this.setState({loading: false, progress: false})
      this.inputRef.current?.focus()
      this.inputRef.current?.select()
    }
  }
}

export default (_: {}) => {
  const [location, setLocation] = useLocation()

  const unlock = () => {
    store.update((s) => {
      s.unlocked = true
      setLocation('/keys/index')
    })
  }

  return <AuthUnlockView unlock={unlock} />
}
