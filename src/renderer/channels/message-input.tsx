import * as React from 'react'

import {Channel, Message, MessageStatus, User} from '@keys-pub/tsclient/lib/keys'
import {keys} from '../rpc/client'

import {Box, Button, CircularProgress, Divider, Input} from '@material-ui/core'

import {openSnack, openSnackError} from '../snack'

type Props = {
  channel: Channel
  user: User
  addMessage: (message: Message) => void
  removeMessage: (message: Message) => void
}

export default (props: Props) => {
  const [text, setText] = React.useState('')

  const sendMessage = async (text: string) => {
    try {
      const prepare = await keys.messagePrepare({
        channel: props.channel.id,
        sender: props.user.kid,
        text: text,
      })
      props.addMessage(prepare.message!)

      try {
        const create = await keys.messageCreate({
          channel: props.channel.id,
          sender: props.user.kid,
          text: text,
        })
      } catch (err) {
        openSnackError(err)
        props.removeMessage(prepare.message!)
        setText(text)
      }
    } catch (err) {
      openSnackError(err)
    }
  }

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(text)
      setText('')
    }
  }

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setText(target.value)
  }, [])

  return (
    <Box
      display="flex"
      flex={1}
      style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginRight: 8,
      }}
    >
      <Box
        display="flex"
        flex={1}
        style={{
          marginLeft: 10,
          marginRight: 10,
          marginTop: 10,
          marginBottom: 10,
          border: '1px solid #efefef',
          borderRadius: 10,
          paddingLeft: 8,
          paddingTop: 4,
          paddingBottom: 4,
          paddingRight: 5,
        }}
      >
        <Input
          autoFocus
          disableUnderline
          fullWidth
          multiline
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          rows={1}
          rowsMax={5}
          value={text}
          placeholder={'Type your message...'}
          spellCheck={false}
        />
      </Box>
    </Box>
  )
}
