// @flow
import React, {Component} from 'react'

import {Box, Button, IconButton, Typography} from '@material-ui/core'
import {Close} from '@material-ui/icons'

import {RowHoriz, RowHorizComp} from '../inbox/details'

import type {Message} from '../../rpc/types'

type Props = {
  close: () => void,
  message: Message,
  follow: () => void,
}

export default class MessageSelectedView extends Component<Props> {
  render() {
    const createdAt = new Date(this.props.message.createdAt).toJSON()
    return (
      <Box display="flex" flex={1}>
        <div style={{marginTop: 20}}> </div>
        {RowHoriz('Message ID', this.props.message.id)}
        {RowHoriz('Created At', createdAt)}
        {RowHoriz('Sender', this.props.message.sender)}
        {RowHorizComp(
          ' ',
          <Button color="secondary" variant="outlined" size="small" onClick={this.props.follow}>
            Follow
          </Button>
        )}

        <IconButton
          onClick={this.props.close}
          color="secondary"
          style={{right: 0, top: 0, position: 'absolute'}}
        >
          <Close />
        </IconButton>
      </Box>
    )
  }
}
