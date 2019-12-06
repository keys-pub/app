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

import {selectedInbox} from './actions'
import {Step} from '../components'

import {push, goBack} from 'connected-react-router'
import {connect} from 'react-redux'

import type {Inbox} from '../../rpc/types'
import type {State as RState} from '../state'

type Props = {
  inbox: Inbox,
  dispatch: (action: any) => any,
}

class InboxLeave extends Component<Props> {
  leave = () => {
    if (!this.props.inbox) return
    /*
    const req: GroupLeaveRequest = {id: this.props.group.id}
    this.props.dispatch(
      groupLeave(req, (resp: GroupLeaveResponse) => {
        this.props.dispatch(push('/inbox'))
      })
    )
    */
  }

  render() {
    if (!this.props.inbox) return null

    let name = this.props.inbox.name
    return (
      <Step title="Archive" next={{label: 'Yes, Leave', action: this.leave}}>
        <Typography variant="body1" style={{paddingBottom: 40}}>
          Are you sure you want to leave {name}? If you are the only person with the passphrase, this group
          will be lost forever.
        </Typography>
      </Step>
    )
  }
}

const mapStateToProps = (state: RState, ownProps: any) => {
  let inbox: ?Inbox = selectedInbox(state.rpc, state.app.selectedInbox)
  if (!inbox) inbox = {name: '', address: '', kid: '', createdAt: 0, error: '', messageCount: 0, snippet: ''}
  return {
    inbox,
  }
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(InboxLeave)
