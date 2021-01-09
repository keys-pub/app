import * as React from 'react'

import {Avatar, Box, Button, Divider, Tabs, Tab, TextField, Typography} from '@material-ui/core'

import {timeString, date} from '../helper'
import dayjs from 'dayjs'
import {serviceColor} from '../theme'

import {Channel, Message, MessageStatus} from '@keys-pub/tsclient/lib/rpc'
import {rpc} from '../rpc/client'

import UserLabel from '../user/label'

import {openSnack, openSnackError} from '../snack'
import {CSSProperties} from '@material-ui/styles'

type Props = {
  channel: string
  message: Message
  index: number
}

export default (props: Props) => {
  const {channel, message, index} = props
  const textStyle: CSSProperties = {}
  switch (message.status) {
    case MessageStatus.MESSAGE_PENDING:
      textStyle.color = '#666'
      break
    case MessageStatus.MESSAGE_ERROR:
      textStyle.color = 'red'
      break
  }
  let user = message.sender?.user?.id
  if (!user) user = message.sender?.id
  if (!user) user = 'unknown'

  const timestr = timeString(message.createdAt)

  const avatarStyle: CSSProperties = {
    // backgroundColor: serviceColor(message.sender?.user?.service),
    width: 32,
    height: 32,
  }
  return (
    <Box display="flex" flexDirection="row" style={{paddingTop: 8, paddingLeft: 10, paddingBottom: 8}}>
      {/* <Avatar variant="rounded" style={{...avatarStyle}}>
        {user.slice(0, 2)}
      </Avatar> */}
      <Box display="flex" flexDirection="column" style={{paddingLeft: 10}}>
        <Box display="flex" flexDirection="row">
          {message.sender?.user && <UserLabel user={message.sender?.user} style={{fontSize: '0.75em'}} />}
          <Typography style={{paddingLeft: 6, fontSize: '0.75em', color: '#999'}}>{timestr}</Typography>
        </Box>
        <Typography style={{...textStyle, paddingTop: 2, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
          {message.text}
        </Typography>
      </Box>
    </Box>
  )
}
