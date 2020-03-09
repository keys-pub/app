import * as React from 'react'

import {Box, Dialog} from '@material-ui/core'

import MessagesHeaderView from './header'
import MessagesListView from './list'
import MessageInputView from '../message-input'

import Selected from './selected'

import {messagePrepare, messageCreate} from '../../rpc/rpc'

import {connect} from 'react-redux'

import {RPCError, Inbox, Message} from '../../rpc/types'

import {
  MessageCreateRequest,
  MessageCreateResponse,
  MessagePrepareRequest,
  MessagePrepareResponse,
} from '../../rpc/types'

type Props = {
  inbox: Inbox
}

type State = {
  selectedMessage: Message | void
  followOpen?: boolean
  pendingMessage: Message | void
  error: string
}

export default class MessagesView extends React.Component<Props, State> {
  listRef: any
  state = {
    selectedMessage: null,
    pendingMessage: null,
    error: '',
  }

  setListRef = (ref: any) => {
    this.listRef = ref
  }

  clearError = () => {
    this.setState({
      error: '',
    })
  }

  submitEditing = (text: string): boolean => {
    // TODO: Queue message if already pending or shake an error to signify previous message still pending
    if (this.state.pendingMessage) {
      return false
    }
    const prep: MessagePrepareRequest = {
      kid: this.props.inbox.kid,
      sender: this.props.inbox.kid,
      text,
    }
    messagePrepare(prep, (err: RPCError, resp: MessagePrepareResponse) => {
      if (err) {
        this.setState({error: err.details})
      }
      if (!resp.message) {
        console.error('No message in response')
        return
      }
      const message: Message = resp.message
      this.setState({pendingMessage: resp.message})
      const req: MessageCreateRequest = {
        ...prep,
        id: message.id,
      }

      this.listRef.setPending(resp.message)

      messageCreate(req, (err: RPCError, resp: MessageCreateResponse) => {
        if (err) {
          // TODO: error
          return
        }
        this.setState({pendingMessage: null})
      })
    })

    return true
  }

  follow = () => {
    this.setState({followOpen: true})
  }

  render() {
    return (
      <Box display="flex" flex={1}>
        <MessagesListView
          ref={this.setListRef}
          kid={this.props.inbox.kid}
          rowCount={this.props.inbox.messageCount}
        />
        <MessageInputView
          defaultValue=""
          submitEditing={this.submitEditing}
          error={this.state.error}
          clearError={this.clearError}
        />
      </Box>
    )
  }
}
