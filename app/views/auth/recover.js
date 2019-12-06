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

import {ipcRenderer} from 'electron'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {client} from '../../rpc/client'

import type {AuthSetupRequest, AuthSetupResponse} from '../../rpc/types'
import type {RPCError, RPCState} from '../../rpc/rpc'

type Props = {
  cancel?: () => any,
  dispatch: (action: any) => any,
}

type State = {
  loading: boolean,
  password: string,
  recovery: string,
  error: string,
}

class AuthRecoverView extends Component<Props, State> {
  state = {
    loading: false,
    password: '',
    recovery: '',
    error: '',

    // For testing
    // password: 'password123',
    // recovery:
    //   'shove quiz copper settle harvest victory shell fade soft neck awake churn craft venue pause utility service degree invite inspire swing detect pipe sibling',
  }
  recovery: any

  constructor(props: Props) {
    super(props)
    this.recovery = React.createRef()
  }

  onInputChangePassword = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({password: e.target ? e.target.value : '', error: ''})
  }
  onInputChangeRecovery = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({recovery: e.target ? e.target.value : '', error: ''})
  }

  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Header loading={this.state.loading} />
        <FormControl error={this.state.error !== ''}>
          <Typography style={{paddingTop: 10, paddingBottom: 10, width: 500}}>
            Enter in your password.
          </Typography>
          <TextField
            autoFocus
            label="Password"
            variant="outlined"
            type="password"
            onChange={this.onInputChangePassword}
            inputProps={{
              onKeyDown: this.onKeyDownPassword,
              style: {fontSize: 32, height: 18},
            }}
            value={this.state.password}
            style={{fontSize: 48, width: 400}}
            disabled={this.state.loading}
          />
          <Box padding={1} />
          <Typography style={{paddingTop: 10, paddingBottom: 10, width: 500}}>
            Enter in the recovery phrase.
          </Typography>

          <TextField
            label="Recovery Phrase"
            variant="outlined"
            onChange={this.onInputChangeRecovery}
            inputProps={{
              onKeyDown: this.onKeyDownRecovery,
            }}
            rows={4}
            rowsMax={4}
            multiline={true}
            value={this.state.recovery}
            style={{fontSize: 48, width: 500}}
            disabled={this.state.loading}
            inputRef={this.recovery}
          />

          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
        </FormControl>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          style={{marginTop: 10}}
        >
          <Button
            color="secondary"
            onClick={this.props.cancel}
            disabled={this.state.loading}
            style={{marginRight: 20}}
          >
            Cancel
          </Button>
          <Button color="primary" variant="outlined" onClick={this.authSetup} disabled={this.state.loading}>
            Recover
          </Button>
        </Box>
      </Box>
    )
  }

  onKeyDownPassword = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      this.recovery.current.focus()
    }
  }
  onKeyDownRecovery = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      // TODO
    }
  }

  authSetup = async () => {
    this.setState({loading: true, error: ''})
    const req: AuthSetupRequest = {
      password: this.state.password,
      pepper: this.state.recovery,
      recover: true,
      publishPublicKey: false,
      force: false,
    }

    console.log('Auth setup')
    // Use client directly to prevent logging the request (password)
    let cl = await client()
    cl.authSetup(req, (err: ?RPCError, resp: ?AuthSetupResponse) => {
      if (err) {
        this.setState({loading: false, error: err.message})
        return
      }
      if (!resp) {
        return
      }
      console.log('Auth setup, set credentials')
      ipcRenderer.send('credentials-set', {authToken: resp.authToken})
      setTimeout(() => {
        this.setState({loading: false})
        this.props.dispatch({type: 'UNLOCK'})
        this.props.dispatch(push('/profile/index'))
      }, 100)
    })
  }
}

export default connect<Props, {cancel: any}, _, _, _, _>()(AuthRecoverView)
