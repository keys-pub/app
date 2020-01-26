import * as React from 'react'

import {connect} from 'react-redux'

import {Divider, Box, Input} from '@material-ui/core'

import DecryptedView from './decrypted'

import {styles} from '../../components'
import {query} from '../state'

import {RPCState} from '../../rpc/rpc'

export type Props = {}

type State = {
  value: string
}

class DecryptView extends React.Component<Props, State> {
  state = {
    value: '',
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || ''})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Divider />
        <Input
          multiline
          autoFocus
          onChange={this.onInputChange}
          value={this.state.value}
          disableUnderline
          inputProps={{
            style: {
              ...styles.mono,
              height: '100%',
            },
          }}
          style={{
            height: '50%',
            paddingLeft: 10,
            paddingTop: 10,
            overflowY: 'scroll',
          }}
        />
        <Divider />
        <Box
          style={{
            height: '50%',
            width: '100%',
          }}
        >
          <DecryptedView value={this.state.value} />
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
  }
}

export default connect(mapStateToProps)(DecryptView)
