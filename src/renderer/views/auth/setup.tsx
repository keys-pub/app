import * as React from 'react'

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles} from '../../components'

import Logo from '../logo'

import {client} from '../../rpc/client'

import * as electron from 'electron'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import {initializeClient} from '../../rpc/client'
import {RPCError} from '../../rpc/rpc'

import {AuthSetupRequest, AuthSetupResponse} from '../../rpc/types'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  loading: boolean
  password: string
  passwordConfirm: string
  passwordError: string
  error: string
}

class AuthSetupView extends React.Component<Props, State> {
  state = {
    loading: false,
    password: '',
    passwordConfirm: '',
    passwordError: '',
    error: '',
  }
  inputConfirm: any

  constructor(props: Props) {
    super(props)
    this.inputConfirm = React.createRef()
  }

  onInputChangePassword = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', passwordError: ''})
  }
  onInputChangeConfirm = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({passwordConfirm: target ? target.value : '', passwordError: ''})
  }

  render() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
        <Logo loading={this.state.loading} top={60} />
        <Typography style={{paddingTop: 0, paddingBottom: 20, width: 550}}>
          Hi! Let's create a password. This password will be used to unlock your local keyring and secure your
          keys. This password is not stored or transmitted anywhere.
        </Typography>
        <FormControl error={this.state.passwordError !== ''}>
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
          <TextField
            label="Confirm Password"
            variant="outlined"
            type="password"
            onChange={this.onInputChangeConfirm}
            inputProps={{
              onKeyDown: this.onKeyDownConfirm,
              style: {fontSize: 32, height: 18},
            }}
            value={this.state.passwordConfirm}
            style={{fontSize: 48, width: 400}}
            disabled={this.state.loading}
            inputRef={this.inputConfirm}
          />
          <FormHelperText id="component-error-text">{this.state.passwordError}</FormHelperText>
        </FormControl>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          style={{marginTop: 10}}
        >
          <Button color="primary" variant="outlined" onClick={this.setPassword} disabled={this.state.loading}>
            Set Password
          </Button>
        </Box>
      </Box>
    )
  }

  setPassword = () => {
    const password = this.state.password
    const confirm = this.state.passwordConfirm
    if (password !== confirm) {
      this.setState({
        passwordError: "Passwords don't match",
      })
      return
    }
    if (password === '') {
      this.setState({
        passwordError: 'Oops, password is empty',
      })
      return
    }
    this.authSetup()
  }

  onKeyDownPassword = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      this.inputConfirm.current.focus()
    }
  }
  onKeyDownConfirm = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      this.setPassword()
    }
  }

  authSetup = async () => {
    const req: AuthSetupRequest = {
      password: this.state.password,
      client: 'app',
    }
    this.setState({loading: true, error: ''})
    // Use client directly to prevent logging the request (password)
    const cl = await client()
    cl.authSetup(req, (err: RPCError | void, resp: AuthSetupResponse | void) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (!resp) {
        return
      }
      initializeClient(resp.authToken)
      setTimeout(() => {
        this.setState({loading: false})
        this.props.dispatch({type: 'UNLOCK'})
        this.props.dispatch(push('/keys/index'))
      }, 100)
    })
  }
}

export default connect()(AuthSetupView)
