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

import Header from './header'

import {client} from '../../rpc/client'

import * as electron from 'electron'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import {RPCError} from '../../rpc/rpc'

import {AuthGenerateRequest, AuthGenerateResponse, AuthSetupRequest, AuthSetupResponse} from '../../rpc/types'

type Props = {
  cancel?: () => void
  dispatch: (action: any) => any
}

type State = {
  loading: boolean
  password: string
  passwordConfirm: string
  passwordError: string
  keyBackup: string
  keyBackupConfirm: string
  setupError: string
  step: number
  snackOpen: boolean
}

class AuthSetupView extends React.Component<Props, State> {
  state = {
    loading: false,
    password: '',
    passwordConfirm: '',
    passwordError: '',
    keyBackup: '',
    keyBackupConfirm: '',
    setupError: '',
    step: 1,
    snackOpen: false,

    // For testing
    // password: 'password123',
    // step: 2,
    // keyBackup:
    //   'shove quiz copper settle harvest victory shell fade soft neck awake churn craft venue pause utility service degree invite inspire swing detect pipe sibling',
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
  onInputChangeKeyBackupConfirm = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({keyBackupConfirm: target ? target.value : '', setupError: ''})
  }

  renderPassword() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
        <Header loading={this.state.loading} />
        <Typography style={{paddingTop: 10, paddingBottom: 20, width: 500, textAlign: 'center'}}>
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

    this.generateKeyBackup()
  }

  copyToClipboard = () => {
    electron.clipboard.writeText(this.state.keyBackup)
    this.setState({snackOpen: true})
  }

  renderCreate() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
        <Header loading={this.state.loading} />
        <Typography style={{paddingBottom: 10, width: 550}}>
          Now you'll need to backup your key. This backup is encrypted with your password.
        </Typography>

        <Typography color="primary" style={{...styles.mono, width: 550}}>
          {this.state.keyBackup}
        </Typography>

        <Button size="small" variant="outlined" onClick={this.copyToClipboard}>
          Copy to Clipboard
        </Button>

        <Typography style={{paddingTop: 20, paddingBottom: 20, width: 550}}>
          You can email this to yourself or save it in the cloud in a place only you can access. This allows
          you to recover your key if your devices go missing. Enter in your encrypted key backup to confirm:
        </Typography>

        <FormControl error={this.state.setupError !== ''}>
          <TextField
            autoFocus
            label="Recovery Confirm"
            variant="outlined"
            onChange={this.onInputChangeKeyBackupConfirm}
            inputProps={{
              onKeyDown: this.onKeyDownKeyBackupConfirm,
            }}
            rows={4}
            rowsMax={4}
            multiline={true}
            value={this.state.keyBackupConfirm}
            style={{fontSize: 48, width: 550}}
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
            onClick={() => this.setState({step: 1, keyBackup: '', keyBackupConfirm: ''})}
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
  onKeyDownKeyBackupConfirm = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      // TODO
    }
  }

  authCreate = () => {
    if (this.state.keyBackup !== this.state.keyBackupConfirm.trim()) {
      this.setState({setupError: "Key backup doesn't match"})
      return
    }
    this.authSetup(this.state.keyBackup)
  }

  generateKeyBackup = async () => {
    const req: AuthGenerateRequest = {
      password: this.state.password,
    }
    this.setState({loading: true, setupError: ''})
    // Use client directly to prevent logging the request (password)
    let cl = await client()
    cl.authGenerate(req, (err: RPCError | void, resp: AuthGenerateResponse | void) => {
      if (err) {
        this.setState({loading: false, setupError: err.details})
        return
      }
      if (!resp) {
        return
      }
      this.setState({loading: false, keyBackup: resp.keyBackup, step: 2})
    })
  }

  authSetup = async (keyBackup: string) => {
    const req: AuthSetupRequest = {
      password: this.state.password,
      keyBackup: keyBackup,
      client: 'app',
    }
    this.setState({loading: true, setupError: ''})
    // Use client directly to prevent logging the request (password)
    let cl = await client()
    cl.authSetup(req, (err: RPCError | void, resp: AuthSetupResponse | void) => {
      if (err) {
        this.setState({loading: false, setupError: err.details})
        return
      }
      if (!resp) {
        return
      }
      electron.ipcRenderer.send('credentials-set', {authToken: resp.authToken})
      setTimeout(() => {
        this.setState({loading: false})
        this.props.dispatch({type: 'UNLOCK'})
        this.props.dispatch(push('/keys/index'))
      }, 100)
    })
  }
}

export default connect()(AuthSetupView)
