import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Logo from './logo'

import {push} from 'connected-react-router'
import {client} from '../../rpc/client'

import {initializeClient} from '../../rpc/client'
import {store} from '../../store'

import {RPCError} from '../../rpc/rpc'
import {AuthUnlockRequest, AuthUnlockResponse} from '../../rpc/types'

type Props = {}

type State = {
  password: string
  loading: boolean
  error: string
}

export default class AuthUnlockView extends React.Component<Props, State> {
  state = {
    password: '',
    loading: false,
    error: '',
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: ''})
  }

  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Logo loading={this.state.loading} top={60} />
        <Typography style={{paddingTop: 10, paddingBottom: 20}}>
          The keyring is locked. Enter your password to continue.
        </Typography>
        <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
          <TextField
            autoFocus
            label="Password"
            variant="outlined"
            type="password"
            onChange={this.onInputChange}
            inputProps={{onKeyDown: this.onKeyDown, style: {fontSize: 32, height: 18}}}
            value={this.state.password}
            style={{fontSize: 48, width: 400}}
            disabled={this.state.loading}
          />
          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
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
    if (password === '') {
      this.setState({
        error: 'Oops, password is empty',
      })
      return
    }

    this.setState({loading: true, error: ''})
    // TODO: Use app name for client name
    const req: AuthUnlockRequest = {
      password: this.state.password,
      client: 'app',
    }
    console.log('Auth unlock')
    const cl = await client()
    // Use client directly to prevent logging the request (password)
    cl.authUnlock(req, (err: RPCError | void, resp: AuthUnlockResponse | void) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (!resp) {
        return
      }

      console.log('Auth unlocking...')
      initializeClient(resp.authToken)
      setTimeout(() => {
        this.setState({loading: false})
        store.dispatch({type: 'UNLOCK'})
        store.dispatch(push('/keys/index'))
      }, 100)
    })
  }
}
