import * as React from 'react'

import {Box, Button, Dialog, Divider, Typography} from '@material-ui/core'

import InboxHeader from './header'
import InboxList from './list'
import InboxFooter from './footer'
import Messages from '../messages'
import MessagesHeader from '../messages/header'

import ErrorView from './error'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

// $FlowFixMe
import {List} from 'immutable'

import {inbox} from '../../rpc/rpc'

import {Inbox, InboxRequest} from '../../rpc/types'

type Props = {
  inbox: Inbox | void
  error: Error
}

type DispatchProp = {
  dispatch: (action: any) => any
}

class InboxRoot extends React.Component<Props & DispatchProp> {
  refresh = () => {
    if (!this.props.inbox) return
    const req: InboxRequest = {kid: this.props.inbox.kid, index: 0}
    // inbox(req)
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

const mapStateToProps = (state: any, ownProps: any) => {
  return {}
}

// $FlowFixMe
export default connect(mapStateToProps)(InboxRoot)
