// @flow
import React, {Component} from 'react'

import {
  Box,
  Button,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles, Step} from '../components'

import {keyBackup} from '../../rpc/rpc'
import {goBack, push} from 'connected-react-router'

import {selectedKID} from '../state'

import {connect} from 'react-redux'

import type {RPCState} from '../../rpc/rpc'
import type {Key, KeyBackupResponse} from '../../rpc/types'

type Props = {
  kid: string,
  dispatch: (action: any) => any,
}

type State = {
  keyBackup: string,
  password: string,
  error: string,
}

class KeyBackupView extends Component<Props, State> {
  state = {
    keyBackup: '',
    password: '',
    error: '',
  }

  keyBackup = (password: string) => {
    this.props.dispatch(
      keyBackup({kid: this.props.kid, password: password}, (resp: KeyBackupResponse) => {
        this.setState({keyBackup: resp.keyBackup})
      })
    )
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({password: e.target ? e.target.value : '', error: ''})
  }

  render() {
    return (
      <Step title="Key Backup">
        <Typography style={{paddingBottom: 20}}>Enter in a password to encrypt your key:</Typography>
        <FormControl error={this.state.error !== ''}>
          <TextField
            autoFocus
            label="Password"
            variant="outlined"
            type="password"
            onChange={this.onInputChange}
            value={this.state.password}
            style={{width: 400}}
          />
          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row">
          <Button color="primary" variant="outlined" onClick={this.keyBackup}>
            Encrypt
          </Button>
        </Box>
        {this.state.keyBackup !== '' && (
          <Box>
            <Typography style={{paddingTop: 20, paddingBottom: 20}}>
              This is your key backup encrypted with your password:
            </Typography>
            <Typography
              style={{
                ...styles.mono,
                marginBottom: 20,
                backgroundColor: 'black',
                color: 'white',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              {this.state.keyBackup}
            </Typography>
            <Box display="flex" flexDirection="row">
              <Button color="secondary" variant="outlined" onClick={this.back}>
                Back
              </Button>
            </Box>
          </Box>
        )}
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState, router: any}, ownProps: any) => {
  return {
    kid: selectedKID(state),
  }
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(KeyBackupView)
