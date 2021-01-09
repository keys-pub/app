import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Typography,
} from '@material-ui/core'

import {CloseIcon, InfoIcon} from '../icons'

import {timeString} from '../helper'
import {serviceColor} from '../theme'

import {Channel, Message, MessageStatus, User} from '@keys-pub/tsclient/lib/rpc'
import {rpc} from '../rpc/client'

import UserLabel from '../user/label'

import MessageInputView from './message-input'
import {openSnack, openSnackError} from '../snack'
import {CSSProperties} from '@material-ui/styles'
import {mono} from '../theme'

import MessageView from './message'
import InfoView from './info'

type Props = {
  channel: Channel
  index: number
  user: User
}

type ScrollPosition = {
  scrollTop: number
  lockToBottom: boolean
}

const scrollPositions: Map<string, ScrollPosition> = new Map()
// const messageCache: Map<string, Message[]> = new Map()
// const sleep = (time: number) => new Promise((r) => setTimeout(r, time))

export default (props: Props) => {
  const [loading, setLoading] = React.useState(false)
  const [infoOpen, setInfoOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([] as Message[])
  const listRef = React.useRef<HTMLDivElement>()
  const endRef = React.useRef<HTMLDivElement>()

  const listMessages = async () => {
    // const messages: Message[] | void = messageCache.get(props.channel.id!)
    // if (messages) {
    //   setMessages(messages)
    //   return
    // }

    try {
      console.log('List messages...')
      setLoading(true)
      const resp = await rpc.messages({
        channel: props.channel.id,
      })
      // messageCache.set(props.channel.id!, resp.messages!)
      const msgs = resp.messages || []
      setMessages(msgs)
      console.log('Messages', msgs.length)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  React.useEffect(() => {
    const sp: ScrollPosition | void = scrollPositions.get(props.channel.id!)
    // console.log('Scroll position:', sp)
    if (!sp || sp.lockToBottom) {
      // console.log('Lock to bottom')
      endRef.current?.scrollIntoView({}) // behavior: 'smooth'
    } else {
      // console.log('Scroll to', sp)
      // listRef.scrollTop(sp.scrollTop)
      listRef.current?.scrollTo({top: sp.scrollTop})
    }
  }, [props.channel.id, messages])

  const onScroll = React.useCallback(
    (e: any) => {
      const t = e.target
      if (t.scrollTop == 0) {
        return
      }
      const lockToBottom = t.scrollHeight - t.scrollTop - 20 <= t.clientHeight
      const sp: ScrollPosition = {scrollTop: t.scrollTop, lockToBottom}
      // console.log('Scroll', sp)
      scrollPositions.set(props.channel.id!, sp)
    },
    [props.channel.id]
  )

  const addMessage = (add: Message) => {
    const next = [...messages, add]
    setMessages(next)
  }

  const removeMessage = (remove: Message) => {
    const next = messages.filter((m: Message) => m.id != remove.id)
    setMessages(next)
  }

  // Clear if channel changed
  React.useEffect(() => {
    setMessages([])
  }, [props.channel?.id])

  React.useEffect(() => {
    listMessages()
  }, [props.index])

  return (
    <Box
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        position="absolute"
        top={0}
        left={0}
        right={0}
        height={40}
        style={{
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          marginRight: 8,
        }}
      >
        <Box display="flex" flexDirection="row">
          <Typography style={{paddingTop: 10, paddingLeft: 16, fontWeight: 500}} variant="h3">
            #{props.channel.name}
          </Typography>
          <Box display="flex" flexGrow={1} />
          <IconButton color="primary" onClick={() => setInfoOpen(true)}>
            <InfoIcon />
          </IconButton>
        </Box>
      </Box>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: 60,
          overflowY: 'auto',
        }}
        ref={listRef as React.RefObject<HTMLDivElement>}
        onScroll={onScroll}
      >
        <Box style={{height: 'calc(100% - 60px)'}} />
        {messages.map((message: Message, index: number) => {
          const ckey = 'm-' + props.channel.id + '-' + index
          return <MessageView key={ckey} channel={props.channel.id!} message={message} index={index} />
        })}
        <div ref={endRef as React.RefObject<HTMLDivElement>} key="end" />
      </div>

      <Box
        display="flex"
        flexDirection="column"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <MessageInputView
          channel={props.channel}
          user={props.user}
          addMessage={addMessage}
          removeMessage={removeMessage}
        />
      </Box>
      <InfoView channel={props.channel} open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Box>
  )
}
