import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {query} from '../state'
import {debounce} from 'lodash'
import {store} from '../../store'

import SignedView from './signed'
import SignKeySelectView from '../keys/skselect'

import {SignState} from '../../reducers/sign'
import {RPCState} from '../../rpc/rpc'

export type Props = {
  signer: string
  defaultValue: string
}

type State = {
  value: string
}

class SignView extends React.Component<Props, State> {
  state = {
    value: this.props.defaultValue,
  }

  debounceDefaultValue = debounce((v: string) => this.setDefaultValue(v), 1000)

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || ''})
    this.debounceDefaultValue(target.value || '')
  }

  setDefaultValue = (v: string) => {
    store.dispatch({type: 'SIGN_VALUE', payload: {value: v}})
  }

  setSigner = (kid: string) => {
    store.dispatch({type: 'SIGN_SIGNER', payload: {signer: kid}})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <SignKeySelectView
          defaultValue={this.props.signer}
          onChange={this.setSigner}
          placeholder="Signer"
          placeholderDisabled
        />
        <Divider />
        <Input
          multiline
          autoFocus
          onChange={this.onInputChange}
          value={this.state.value}
          disableUnderline
          inputProps={{
            style: {
              height: '100%',
            },
          }}
          style={{
            height: '100%',
            paddingLeft: 10,
            paddingTop: 10,
            overflowY: 'scroll',
          }}
        />
        <Divider />
        <SignedView signer={this.props.signer} value={this.state.value} />
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; sign: SignState; router: any}, ownProps: any) => {
  return {
    signer: state.sign.signer || '',
    defaultValue: state.sign.value || '',
  }
}
export default connect(mapStateToProps)(SignView)
