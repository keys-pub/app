// @flow
import React, {Component} from 'react'

import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {clipboard, shell} from 'electron'

import {styles, Link, Step} from '../components'

import Header from './header'

import {ipcRenderer} from 'electron'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {authSetup, rand} from '../../rpc/rpc'

import type {AuthSetupRequest, AuthSetupResponse, RandRequest, RandResponse} from '../../rpc/types'
import type {RPCError, RPCState} from '../../rpc/rpc'

type Props = {
  cancel?: () => void,
  dispatch: (action: any) => any,
}

type State = {
  loading: boolean,
  password: string,
  passwordConfirm: string,
  passwordError: string,
  recovery: string,
  recoveryConfirm: string,
  setupError: string,
  step: number,
  snackOpen: boolean,
}

class AuthSetupView extends Component<Props, State> {
  state = {
    loading: false,
    password: '',
    passwordConfirm: '',
    passwordError: '',
    recovery: '',
    recoveryConfirm: '',
    setupError: '',
    step: 1,
    snackOpen: false,

    // For testing
    // password: 'password123',
    // step: 2,
    // recovery:
    //   'shove quiz copper settle harvest victory shell fade soft neck awake churn craft venue pause utility service degree invite inspire swing detect pipe sibling',
  }
  inputConfirm: any

  constructor(props: Props) {
    super(props)
    this.inputConfirm = React.createRef()
  }

  componentDidMount() {
    this.loadRecovery()
  }

  onInputChangePassword = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({password: e.target ? e.target.value : '', passwordError: ''})
  }
  onInputChangeConfirm = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({passwordConfirm: e.target ? e.target.value : '', passwordError: ''})
  }
  onInputChangeRecoveryConfirm = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({recoveryConfirm: e.target ? e.target.value : '', setupError: ''})
  }

  renderPassword() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
        <Header loading={this.state.loading} />
        <Typography style={{paddingBottom: 20, width: 500, textAlign: 'center'}}>
          Let's create a password. Your password needs to be at least 10 characters.
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
          <Button
            color="secondary"
            onClick={this.props.cancel}
            disabled={this.state.loading}
            style={{marginRight: 20}}
          >
            Back
          </Button>
          <Button color="primary" variant="outlined" onClick={this.setPassword} disabled={this.state.loading}>
            Next
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
    if (password.length < 10) {
      this.setState({
        passwordError: 'Password is too short',
      })
      return
    }

    this.setState({step: 2})
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.recovery)
    this.setState({snackOpen: true})
  }

  renderCreate() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
        <Header loading={this.state.loading} />
        <Typography style={{paddingBottom: 20, width: 500}}>
          Now you'll need to backup a (secret) recovery phrase.
        </Typography>

        <Typography color="primary" style={{...styles.mono, paddingBottom: 10, width: 500}}>
          {this.state.recovery}
        </Typography>

        <Button size="small" variant="outlined" onClick={this.copyToClipboard}>
          Copy to Clipboard
        </Button>

        <Typography style={{paddingTop: 20, paddingBottom: 20, width: 500}}>
          A good way to backup this phrase is to email it to yourself or save it in the cloud in a place only
          you can access. After backing up the recovery phrase, enter it here:
        </Typography>

        <FormControl error={this.state.setupError !== ''}>
          <TextField
            autoFocus
            label="Recovery Confirm"
            variant="outlined"
            onChange={this.onInputChangeRecoveryConfirm}
            inputProps={{
              onKeyDown: this.onKeyDownRecoveryConfirm,
            }}
            rows={3}
            rowsMax={3}
            multiline={true}
            value={this.state.recoveryConfirm}
            style={{fontSize: 48, width: 500}}
            disabled={this.state.loading}
          />

          <FormHelperText id="component-error-text">{this.state.setupError}</FormHelperText>
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
            onClick={() => this.setState({step: 1})}
            disabled={this.state.loading}
            style={{marginRight: 20}}
          >
            Back
          </Button>
          <Button color="primary" variant="outlined" onClick={this.authCreate} disabled={this.state.loading}>
            Create my Key
          </Button>
        </Box>

        <Snackbar
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          open={this.state.snackOpen}
          autoHideDuration={2000}
          onClose={() =>
            this.setState({
              snackOpen: false,
            })
          }
        >
          <SnackbarContent
            aria-describedby="client-snackbar"
            message={<span id="client-snackbar">Copied to Clipboard</span>}
          />
        </Snackbar>
      </Box>
    )
  }

  render() {
    switch (this.state.step) {
      case 1:
        return this.renderPassword()
      case 2:
        return this.renderCreate()
    }
    return null
  }

  onKeyDownPassword = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      this.inputConfirm.current.focus()
    }
  }
  onKeyDownConfirm = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      this.setPassword()
    }
  }
  onKeyDownRecoveryConfirm = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      // TODO
    }
  }

  authCreate = () => {
    if (this.state.recovery !== this.state.recoveryConfirm.trim()) {
      this.setState({setupError: "Recovery phrase doesn't match"})
      return
    }
    this.authSetup(this.state.recovery)
  }

  loadRecovery = () => {
    const req: RandRequest = {
      length: 32,
      encoding: 'BIP39',
    }
    this.props.dispatch(
      rand(req, (resp: RandResponse) => {
        this.setState({recovery: resp.data})
      })
    )
  }

  authSetup = (recovery: string) => {
    this.setState({loading: true, setupError: ''})
    const req: AuthSetupRequest = {
      password: this.state.password,
      pepper: recovery,
      publishPublicKey: false,
      recover: false,
      force: false,
      client: 'app',
    }
    this.props.dispatch(
      authSetup(
        req,
        (resp: AuthSetupResponse) => {
          ipcRenderer.send('credentials-set', {authToken: resp.authToken})
          setTimeout(() => {
            this.setState({loading: false})
            this.props.dispatch({type: 'UNLOCK'})
            this.props.dispatch(push('/profile/index'))
          }, 100)
        },
        (err: RPCError) => {
          this.setState({loading: false, setupError: err.message})
        }
      )
    )
  }
}

export default connect<Props, {cancel: any}, _, _, _, _>()(AuthSetupView)
