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
  TextField,
  Typography,
} from '@material-ui/core'

import {Step} from '../components'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {keyRecover} from '../../rpc/rpc'
import type {KeyRecoverRequest, KeyRecoverResponse, RPCError} from '../../rpc/rpc'

type Props = {
  dispatch: (action: any) => any,
}

type State = {
  keyBackup: string,
  password: string,
  error: string,
}

class KeyRecoverView extends Component<Props, State> {
  state = {
    keyBackup: '',
    password: '',
    error: '',
  }

  recover = () => {
    const req: KeyRecoverRequest = {
      keyBackup: this.state.keyBackup,
      password: this.state.password,
    }
    this.props.dispatch(
      keyRecover(
        req,
        (resp: KeyRecoverResponse) => {
          this.props.dispatch(push('/key/index?kid=' + resp.kid))
        },
        (err: RPCError) => {
          this.setState({error: err.message})
        }
      )
    )
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  onBackupInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({keyBackup: e.target.value, error: ''})
  }

  onPasswordInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({password: e.target.value, error: ''})
  }

  render() {
    return (
      <Step
        title="Recover your Key"
        prev={{label: 'Back', action: this.back}}
        next={{label: 'Recover', action: this.recover}}
      >
        <Box>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
            <TextField
              multiline
              autoFocus
              label="Key Backup"
              rows={5}
              variant="outlined"
              placeholder={''}
              onChange={this.onBackupInputChange}
              value={this.state.keyBackup}
            />
            <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
          </FormControl>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
            <TextField
              autoFocus
              label="Password"
              variant="outlined"
              type="password"
              onChange={this.onPasswordInputChange}
              value={this.state.password}
            />
            <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
          </FormControl>
        </Box>
      </Step>
    )
  }
}

export default connect<Props, {}, _, _, _, _>()(KeyRecoverView)
