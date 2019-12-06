// @flow
import React, {Component} from 'react'

import {Box, Button, Input, InputLabel, FormControl, Typography} from '@material-ui/core'

import {styles, Step} from '../components'

import {keyBackup} from '../../rpc/rpc'
import {goBack, push} from 'connected-react-router'

import {connect} from 'react-redux'

import {currentKey} from '../state'

import type {RPCState} from '../../rpc/rpc'
import type {Key, KeyBackupResponse} from '../../rpc/types'

type Props = {
  key: Key,
  dispatch: (action: any) => any,
}

type State = {
  recoveryPhrase: string,
}

class KeyBackupView extends Component<Props, State> {
  state = {
    recoveryPhrase: '',
  }

  componentDidMount() {
    const action = keyBackup({kid: this.props.key.kid}, (resp: KeyBackupResponse) => {
      this.setState({recoveryPhrase: resp.seedPhrase})
    })
    this.props.dispatch(action)
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  render() {
    return (
      <Step title="Backup Key" next={{label: 'OK', action: this.back}}>
        <Typography style={{paddingBottom: 20}}>
          Write this phrase down on a piece of paper and keep it somewhere safe. This phrase will allow you to
          recover your key.
        </Typography>
        <Typography
          style={{
            ...styles.mono,
            marginBottom: 40,
            backgroundColor: 'black',
            color: 'white',
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 30,
            paddingRight: 30,
          }}
        >
          {this.state.recoveryPhrase}
        </Typography>
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}) => {
  return {key: currentKey(state.rpc)}
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(KeyBackupView)
