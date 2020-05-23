import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Logo from '../logo'

import {push} from 'connected-react-router'

import {ipcRenderer} from 'electron'
import {store} from '../../store'

import {authUnlock} from '../../rpc/keys'
import {RPCError, AuthUnlockRequest, AuthUnlockResponse, AuthType} from '../../rpc/keys.d'

type Props = {}

type State = {
  password: string
  loading: boolean
  progress: boolean
  error: string
}

export default class AuthUnlockView extends React.Component<Props, State> {
  state = {
    password: '',
    loading: false,
    progress: false,
    error: '',
  }
  private inputRef = React.createRef<HTMLInputElement>()

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: ''})
  }

  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Logo loading={this.state.progress} top={60} />
        <Typography style={{paddingTop: 10, paddingBottom: 20}}>
          The keyring is locked. Enter your password to continue.
        </Typography>
        <FormControl error={this.state.error !== ''} style={{marginBottom: 10}}>
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
          <FormHelperText id="component-error-text">{this.state.error || ' '}</FormHelperText>
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
        error: 'Oops, password is empty',
      })
      this.inputRef?.current?.focus()
      return
    }

    // Have progress indicator come after a little delay, usually it's very fast
    // and we don't want show the loading indicator just for a split second.
    const timeout = setTimeout(() => {
      this.setState({progress: true})
    }, 2000)

    this.setState({loading: true, error: ''})
    // TODO: Use config app name for client name
    const req: AuthUnlockRequest = {
      secret: this.state.password,
      type: AuthType.PASSWORD_AUTH,
      client: 'app',
    }
    console.log('Auth unlock')
    authUnlock(req, (err: RPCError, resp: AuthUnlockResponse) => {
      clearTimeout(timeout)
      if (err) {
        this.setState({loading: false, progress: false, error: err.details})
        this.inputRef.current?.focus()
        this.inputRef.current?.select()
        return
      }

      console.log('Auth unlocking...')
      ipcRenderer.send('authToken', {authToken: resp.authToken})
      setTimeout(() => {
        this.setState({loading: false, progress: false})
        store.dispatch({type: 'UNLOCK'})
        store.dispatch(push('/keys/index'))
      }, 100)
    })
  }
}
