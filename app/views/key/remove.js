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

import {keyBackup, keyRemove} from '../../rpc/rpc'
import {currentKey} from '../state'

import {styles, Step} from '../components'

import {push, goBack} from 'connected-react-router'
import {connect} from 'react-redux'

import type {Key} from '../../rpc/types'
import type {
  KeyBackupRequest,
  KeyBackupResponse,
  KeyRemoveRequest,
  KeyRemoveResponse,
  RPCError,
  RPCState,
} from '../../rpc/rpc'

type Props = {
  key: Key,
  dispatch: (action: any) => any,
}

type State = {
  error: string,
  seedPhrase: string,
  confirm: string,
}

class KeyRemoveView extends Component<Props, State> {
  state = {
    error: '',
    seedPhrase: '',
    confirm: '',
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  componentDidMount() {
    const action = keyBackup({kid: this.props.key.kid}, (resp: KeyBackupResponse) => {
      this.setState({seedPhrase: resp.seedPhrase})
    })
    this.props.dispatch(action)
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({confirm: e.target.value, error: ''})
  }

  removeKey = () => {
    const req: KeyRemoveRequest = {kid: this.props.key.kid, seedPhrase: this.state.confirm}
    this.props.dispatch(
      keyRemove(
        req,
        (resp: KeyRemoveResponse) => {
          // TODO
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  render() {
    return (
      <Step
        title="Remove a Key"
        prev={{label: 'Cancel', action: () => this.props.dispatch(goBack())}}
        next={{label: 'Yes, Delete', action: this.removeKey}}
      >
        <Typography style={{paddingBottom: 20}}>
          Are you really sure you want to delete your user key? If you haven't backed up your user key backup
          phrase, you won't be able to recover your user key.
        </Typography>
        <Typography style={{paddingBottom: 10}}>To delete, enter the backup phrase:</Typography>
        <Typography
          style={{
            ...styles.mono,
            padding: 10,
            backgroundColor: 'black',
            color: 'white',
            textAlign: 'center',
            marginBottom: 30,
          }}
        >
          {this.state.seedPhrase}
        </Typography>
        <FormControl error={this.state.error !== ''}>
          <Input
            autoFocus
            multiline
            rows={3}
            placeholder={''}
            onChange={this.onInputChange}
            value={this.state.confirm}
          />
          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
        </FormControl>
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  return {key: currentKey(state.rpc)}
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(KeyRemoveView)
