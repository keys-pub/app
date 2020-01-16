import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from './header'

import * as electron from 'electron'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import {client} from '../../rpc/client'

import {AuthSetupRequest, AuthSetupResponse, RPCError} from '../../rpc/rpc'

type Props = {
  cancel?: () => any
  dispatch: (action: any) => any
}

type State = {
  loading: boolean
  password: string
  keyBackup: string
  error: string
}

class AuthRecoverView extends React.Component<Props, State> {
  state = {
    loading: false,
    password: '',
    keyBackup: '',
    error: '',
  }
  keyBackupRef: any

  constructor(props: Props) {
    super(props)
    this.keyBackupRef = React.createRef()
  }

  onInputChangePassword = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: ''})
  }
  onInputChangeKeyBackup = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({keyBackup: target ? target.value : '', error: ''})
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
            onChange={this.onInputChangeKeyBackup}
            inputProps={{
              onKeyDown: this.onKeyDownKeyBackup,
            }}
            rows={4}
            rowsMax={4}
            multiline={true}
            value={this.state.keyBackup}
            style={{fontSize: 48, width: 500}}
            disabled={this.state.loading}
            inputRef={this.keyBackupRef}
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

  onKeyDownPassword = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.keyBackupRef.current.focus()
    }
  }
  onKeyDownKeyBackup = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // TODO
    }
  }

  authSetup = async () => {
    this.setState({loading: true, error: ''})
    const req: AuthSetupRequest = {
      password: this.state.password,
      keyBackup: this.state.keyBackup,
      clientName: 'app',
    }

    console.log('Auth setup')
    // Use client directly to prevent logging the request (password)
    let cl = await client()
    cl.authSetup(req, (err: RPCError | void, resp: AuthSetupResponse | void) => {
      if (err) {
        this.setState({loading: false, error: err.message})
        return
      }
      if (!resp) {
        return
      }
      console.log('Auth setup, set credentials')
      electron.ipcRenderer.send('credentials-set', {authToken: resp.authToken})
      setTimeout(() => {
        this.setState({loading: false})
        this.props.dispatch({type: 'UNLOCK'})
        this.props.dispatch(push('/keys/index'))
      }, 100)
    })
  }
}

export default connect()(AuthRecoverView)
