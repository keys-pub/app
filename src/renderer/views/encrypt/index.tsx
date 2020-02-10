import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, Typography, Box} from '@material-ui/core'

import {styles} from '../../components'
import RecipientsView from '../user/recipients'
import EncryptedView from './encrypted'
import SignKeySelectView from '../keys/skselect'

import {store} from '../../store'
import {query} from '../state'
import {debounce} from 'lodash'

import {EncryptState} from '../../reducers/encrypt'
import {RPCState} from '../../rpc/rpc'

import {Key} from '../../rpc/types'

export type Props = {
  recipients: Key[]
  signer: string
  defaultValue: string
}

type State = {
  value: string
}

class EncryptView extends React.Component<Props, State> {
  state = {
    value: this.props.defaultValue,
  }

  debounceDefaultValue = debounce((v: string) => this.setDefaultValue(v), 1000)

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || ''})
    this.debounceDefaultValue(target.value || '')
  }

  setRecipients = (recipients: Key[]) => {
    store.dispatch({type: 'ENCRYPT_RECIPIENTS', payload: {recipients}})
  }

  setSigner = (kid: string) => {
    store.dispatch({type: 'ENCRYPT_SIGNER', payload: {signer: kid}})
  }

  setDefaultValue = (v: string) => {
    store.dispatch({type: 'ENCRYPT_VALUE', payload: {value: v}})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <Box style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 6, paddingRight: 2}}>
          <RecipientsView recipients={this.props.recipients} onChange={this.setRecipients} />
        </Box>
        <Divider />
        <SignKeySelectView
          defaultValue={this.props.signer}
          onChange={this.setSigner}
          placeholder="Anonymous"
          itemLabel="Signed by"
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
            recipients={this.props.recipients}
            value={this.state.value}
            signer={this.props.signer}
          />
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; encrypt: EncryptState; router: any}, ownProps: any) => {
  return {
    recipients: state.encrypt.recipients || [],
    signer: state.encrypt.signer || '',
    defaultValue: state.encrypt.value || '',
  }
}
export default connect(mapStateToProps)(EncryptView)
