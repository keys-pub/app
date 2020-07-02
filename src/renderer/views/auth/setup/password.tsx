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

import Logo from '../../logo'

import {push} from 'connected-react-router'
import {store} from '../../../store'

import {authSetup, authUnlock} from '../../../rpc/keys'
import {
  RPCError,
  AuthSetupRequest,
  AuthSetupResponse,
  AuthUnlockRequest,
  AuthUnlockResponse,
  AuthType,
} from '../../../rpc/keys.d'
import {ipcRenderer} from 'electron'

type Props = {
  back: () => void
}
type State = {
  loading: boolean
  password: string
  passwordConfirm: string
  passwordError: string
  error: string
}

export default class AuthSetupPasswordView extends React.Component<Props, State> {
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
        <Typography style={{paddingTop: 0, paddingBottom: 20, width: 550, textAlign: 'center'}}>
          This password will be used to unlock your vault and secure your keys and secrets. <br />
          This password is not stored or transmitted anywhere.
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
          <FormHelperText id="component-error-text">{this.state.passwordError || ' '}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row" style={{marginTop: 10, width: 400}}>
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.props.back}
            disabled={this.state.loading}
          >
            Back
          </Button>
          <Box flex={1} flexGrow={1} />
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
      secret: this.state.password,
      type: AuthType.PASSWORD_AUTH,
    }
    this.setState({loading: true, error: ''})
    authSetup(req, (err: RPCError, resp: AuthSetupResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }

      const reqUnlock: AuthUnlockRequest = {
        secret: this.state.password,
        type: AuthType.PASSWORD_AUTH,
        client: 'app',
      }

      authUnlock(reqUnlock, (err: RPCError, resp: AuthUnlockResponse) => {
        ipcRenderer.send('authToken', {authToken: resp.authToken})
        setTimeout(() => {
          this.setState({loading: false})
          store.dispatch({type: 'UNLOCK'})
          store.dispatch(push('/keys/index'))
        }, 100)
      })
    })
  }
}
