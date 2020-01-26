import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {query} from '../state'
import {debounce} from 'lodash'

import SignedView from './signed'
import SignKeySelectView from '../keys/skselect'

import {RPCState} from '../../rpc/rpc'

export type Props = {
  kid: string
}

type State = {
  kid: string
  value: string
}

class SignView extends React.Component<Props, State> {
  state = {
    kid: this.props.kid,
    value: '',
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || ''})
  }

  setSigner = (kid: string) => {
    console.log('Set signer:', kid)
    this.setState({kid: kid})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <SignKeySelectView defaultValue={this.props.kid} onChange={this.setSigner} />
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
        <SignedView kid={this.state.kid} value={this.state.value} />
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
  }
}
export default connect(mapStateToProps)(SignView)
