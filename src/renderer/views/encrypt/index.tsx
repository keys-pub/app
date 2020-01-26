import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, Typography, Box} from '@material-ui/core'

import {styles} from '../../components'
import RecipientsView from '../user/recipients'
import EncryptedView from './encrypted'
import SignKeySelectView from '../keys/skselect'

import {store} from '../../store'
import {query} from '../state'

import {RPCState} from '../../rpc/rpc'

import {UserSearchResult} from '../../rpc/types'

export type Props = {
  kid: string
}

type State = {
  recipients: UserSearchResult[]
  sender: string
  value: string
}

class EncryptView extends React.Component<Props, State> {
  state = {
    recipients: [],
    sender: this.props.kid,
    value: '',
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || ''})
  }

  setRecipients = (recipients: UserSearchResult[]) => {
    this.setState({recipients})
  }

  setSender = (kid: string) => {
    console.log('Set signer:', kid)
    this.setState({sender: kid})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <Box style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 6, paddingRight: 2}}>
          <RecipientsView onChange={this.setRecipients} />
        </Box>
        <Divider />
        <SignKeySelectView defaultValue={this.props.kid} onChange={this.setSender} includeAnon />
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
              overflowY: 'scroll',
            },
          }}
          style={{
            height: '50%',
            paddingLeft: 10,
            paddingTop: 10,
          }}
        />
        <Divider />
        <Box
          style={{
            height: '50%',
            width: '100%',
          }}
        >
          <EncryptedView
            recipients={this.state.recipients}
            value={this.state.value}
            sender={this.state.sender}
          />
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
export default connect(mapStateToProps)(EncryptView)
