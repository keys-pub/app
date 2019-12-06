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
  recoveryPhrase: string,
  error: string,
}

class KeyRecoverView extends Component<Props, State> {
  state = {
    recoveryPhrase: '',
    error: '',
  }

  recover = () => {
    const req: KeyRecoverRequest = {
      seedPhrase: this.state.recoveryPhrase,
      publishPublicKey: false,
    }
    this.props.dispatch(
      keyRecover(
        req,
        (resp: KeyRecoverResponse) => {
          this.props.dispatch(push('/profile/index'))
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

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({recoveryPhrase: e.target.value, error: ''})
  }

  render() {
    return (
      <Step
        title="Recover your Key"
        prev={{label: 'Back', action: this.back}}
        next={{label: 'Recover', action: this.recover}}
      >
        <Box>
          <Typography variant="subtitle1" style={{paddingBottom: 10}}>
            Enter your key backup recovery phrase.
          </Typography>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
            <TextField
              multiline
              autoFocus
              rows={5}
              variant="outlined"
              placeholder={''}
              onChange={this.onInputChange}
              value={this.state.recoveryPhrase}
            />
            <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
          </FormControl>
        </Box>
      </Step>
    )
  }
}

export default connect<Props, {}, _, _, _, _>()(KeyRecoverView)
