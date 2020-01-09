// @flow
import React, {Component} from 'react'

import {
  Box,
  Button,
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles, Link, Step} from '../components'

import Header from './header'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'
import {client} from '../../rpc/client'

import {ipcRenderer} from 'electron'

import {authUnlock} from '../../rpc/rpc'

import type {AuthUnlockRequest, AuthUnlockResponse} from '../../rpc/types'
import type {RPCError, RPCState} from '../../rpc/rpc'

type Props = {
  dispatch: (action: any) => any,
}

type State = {
  password: string,
  loading: boolean,
  error: string,
}

class AuthUnlockView extends Component<Props, State> {
  state = {
    password: '',
    loading: false,
    error: '',
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({password: e.target ? e.target.value : '', error: ''})
  }

  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Header loading={this.state.loading} />
        <Typography style={{paddingTop: 10, paddingBottom: 20}}>
          Your keyring is locked. Verify your master password to continue.
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

  onKeyDown = (event: SyntheticKeyboardEvent<*>) => {
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
    // Use client directly to prevent logging the request (password)
    let cl = await client()
    cl.authUnlock(req, (err: ?RPCError, resp: ?AuthUnlockResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (!resp) {
        return
      }

      console.log('Auth unlocking...')
      ipcRenderer.send('credentials-set', {authToken: resp.authToken})
      setTimeout(() => {
        this.setState({loading: false})
        this.props.dispatch({type: 'UNLOCK'})
        this.props.dispatch(push('/keys/index'))
      }, 100)
    })
  }
}

export default connect<Props, {}, _, _, _, _>()(AuthUnlockView)
