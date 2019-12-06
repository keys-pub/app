// @flow
import React, {Component} from 'react'

import {Box, Button, Dialog, Divider, Typography} from '@material-ui/core'

import InboxHeader from './header'
import InboxList from './list'
import InboxFooter from './footer'
import Messages from '../messages'
import MessagesHeader from '../messages/header'
import {selectedInbox, inboxRows} from './actions'

import ErrorView from './error'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

// $FlowFixMe
import {List} from 'immutable'

import {inbox} from '../../rpc/rpc'

import type {Inbox, InboxRequest} from '../../rpc/types'
import type {RPCState} from '../../rpc/rpc'
import type {InboxRow} from './types'
import type {State} from '../state'

type Props = {
  inbox: ?Inbox,
  error: ?Error,
}

type DispatchProp = {
  dispatch: (action: any) => any,
}

class InboxRoot extends Component<Props & DispatchProp> {
  refresh = () => {
    if (!this.props.inbox) return
    const req: InboxRequest = {kid: this.props.inbox.kid, index: 0}
    this.props.dispatch(inbox(req))
  }

  render() {
    return (
      <Box display="flex" flex={1}>
        {this.props.inbox && (
          <Box display="flex" flex={1}>
            <MessagesHeader inbox={this.props.inbox} info={() => {}} leave={() => {}} />
            {this.props.error && ErrorView(this.props.error, this.props.inbox)}
            {!this.props.error && <Messages inbox={this.props.inbox} />}
          </Box>
        )}
      </Box>
    )
  }
}

const mapStateToProps = (state: State, ownProps: any) => {
  const inbox: ?Inbox = selectedInbox(state.rpc, state.app.selectedInbox)
  const error: ?Error = inbox && inbox.error ? new Error(inbox.error) : null

  return {inbox, error}
}

// $FlowFixMe
export default connect<Props, {}, _, _, _, _>(mapStateToProps)(InboxRoot)
