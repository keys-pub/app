import * as React from 'react'
import {CSSProperties} from 'react'

import {Button, Divider, Input, LinearProgress, Typography, Box} from '@material-ui/core'

import Alert, {Color as AlertColor} from '@material-ui/lab/Alert'

import Link from '../components/link'
import Autocomplete from '../keys/autocomplete'

import * as grpc from '@grpc/grpc-js'
import {shell} from 'electron'

import Header from '../header'
import TextInputView from '../textinput'

import {generateID} from '../helper'
import {Store} from 'pullstate'

import {
  welcomeStatus,
  canStartStatus,
  connectingStatus,
  connectedStatus,
  disconnectedStatus,
  errorStatus,
} from './status'

import {rpc} from '../rpc/client'
import {EDX25519, EDX25519Public} from '../rpc/keys'
import {
  WormholeStatus,
  WormholeInput,
  WormholeOutput,
  WormholeMessageStatus,
} from '@keys-pub/tsclient/lib/rpc'
import {ClientDuplexStream, RPCError} from '@keys-pub/tsclient'

import {WormholeMessage, WormholeMessageType} from './types'

type WormholeState = {
  sender: string
  recipient: string
  messages: WormholeMessage[]
}

const store = new Store<WormholeState>({
  sender: '',
  recipient: '',
  messages: [],
})

export type Props = {
  sender: string
  recipient: string
  messages: WormholeMessage[]
  setRecipient: (recipient?: string) => void
  setSender: (sender?: string) => void
  setMessages: (messages: WormholeMessage[]) => void
}

type State = {
  loading: boolean
  connected: boolean
  rows: readonly WormholeMessage[]
}

class WormholeView extends React.Component<Props, State> {
  state = {
    loading: false,
    connected: false,
    rows: this.props.messages,
  }
  private listRef: React.RefObject<HTMLDivElement> = React.createRef()
  private wormhole?: ClientDuplexStream<WormholeInput, WormholeOutput>

  componentDidMount() {
    if (this.state.rows.length == 0) {
      this.setState({rows: [welcomeStatus()]})
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.sender != prevProps.sender || this.props.recipient != prevProps.recipient) {
      if (this.props.recipient && this.props.sender) {
        this.setState({rows: [welcomeStatus(), canStartStatus()]})
      } else {
        this.setState({rows: [welcomeStatus()]})
      }
    }
  }

  componentWillUnmount() {
    this.close()
  }

  openInvite = () => {}

  start = async () => {
    console.log('Wormhole start...')

    this.addRow(connectingStatus(this.props.recipient))

    this.setState({loading: true, connected: false})
    this.wormhole = rpc.wormhole()
    this.wormhole.on('error', (err: RPCError) => {
      this.setState({loading: false, connected: false})
      if (err.code == grpc.status.CANCELLED || err.message == 'closed') {
        // Closed
        this.addRow(disconnectedStatus())
      } else {
        this.addRow(errorStatus(err.message))
      }
      return
    })
    this.wormhole.on('data', (res: WormholeOutput) => {
      if (this.state.loading && res.status == WormholeStatus.WORMHOLE_CONNECTED) {
        this.setState({loading: false, connected: true})
        this.addRow(connectedStatus())
      }

      if (res.status == WormholeStatus.WORMHOLE_CLOSED) {
        this.setState({loading: false, connected: false})
        this.addRow(disconnectedStatus())
        return
      }

      switch (res.message?.status) {
        case WormholeMessageStatus.WORMHOLE_MESSAGE_ACK:
          this.ack(res.message.id!)
          return
      }

      if ((res.message?.text?.length || 0) > 0) {
        this.addRow({id: res.message!.id!, text: res.message!.text!, type: WormholeMessageType.Received})
      }
    })
    this.wormhole.on('end', () => {
      this.setState({loading: false})
    })

    const req: WormholeInput = {
      sender: this.props.sender,
      recipient: this.props.recipient,
      invite: '',
      id: '',
      text: '',
    }
    console.log('Wormhole request:', req)
    this.wormhole.write(req)
  }

  send = (id: string, text: string) => {
    if (text == '') {
      return
    }
    if (!this.wormhole) {
      return
    }
    const req: WormholeInput = {
      id: id,
      text: text,
      sender: this.props.sender,
      recipient: this.props.recipient,
      invite: '',
    }
    // TODO: Check if wormhole closed
    this.wormhole.write(req)
  }

  close = () => {
    // TODO: Check if wormhole already closed
    if (this.wormhole) {
      this.addRowUnlessLast(disconnectedStatus())
      this.wormhole.cancel()
      this.wormhole = undefined
    }
    this.setState({loading: false, connected: false})
  }

  ack = (id: string) => {
    const nextRows = this.state.rows.map((r: WormholeMessage) => {
      if (r.id == id) {
        return {...r, pending: false}
      }
      return r
    })
    this.setState({rows: nextRows})
  }

  rowExists = (row: WormholeMessage): boolean => {
    return this.state.rows.some((r: WormholeMessage) => {
      return r.id == row.id
    })
  }

  rowLast = (): WormholeMessage | undefined => {
    if (this.state.rows.length > 0) {
      return this.state.rows[this.state.rows.length - 1]
    }
    return undefined
  }

  addRowUnlessExists = (row: WormholeMessage) => {
    if (!this.rowExists(row)) {
      this.addRow(row)
    }
  }

  addRowUnlessLast = (row: WormholeMessage) => {
    const last = this.rowLast()
    if (last?.id != row.id) {
      this.addRow(row)
    }
  }

  addRow = (row: WormholeMessage) => {
    const nextRows = [...this.state.rows, row]

    this.setState({
      rows: nextRows,
    })

    this.props.setMessages(nextRows)

    // TODO: Don't scroll to bottom if we aren't at the bottom
    this.forceUpdate(() => {
      this.scrollToBottom()
    })
  }

  submitEditing = async (text: string) => {
    if (text == '') {
      return
    }
    const id = await generateID()
    this.addRow({id: id, text: text, type: WormholeMessageType.Sent, pending: true})
    this.send(id, text)
  }

  scrollToBottom = () => {
    const component = this.listRef.current
    if (component) {
      const scrollHeight = component.scrollHeight
      const height = component.clientHeight
      const maxScrollTop = scrollHeight - height
      component.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
    }
  }

  renderItem = (index: number, key: string) => {
    const row: WormholeMessage = this.state.rows[index]
    let style
    let className
    let element
    switch (row.type) {
      case WormholeMessageType.Sent:
        style = ownerStyle
        className = 'message-owner'
        element = <Typography>{row.text}</Typography>
        break
      case WormholeMessageType.Received:
        style = otherStyle
        className = 'message-other'
        element = <Typography>{row.text}</Typography>
        break
      case WormholeMessageType.Status:
        style = {}
        className = 'message-status'
        element = (
          <Alert severity={row.severity as AlertColor}>
            <Typography style={{display: 'inline'}}>{row.text}</Typography>
            {row.link && (
              <Typography style={{display: 'inline'}}>
                <Link span onClick={() => shell.openExternal('https://' + row.link + '.html')}>
                  {row.link}
                </Link>
                .
              </Typography>
            )}
          </Alert>
        )
        break
    }

    return (
      <Box key={key} className={className} style={{...rowStyle, ...style}}>
        {element}
      </Box>
    )
  }

  renderStartStop() {
    const canStart = this.props.sender != '' && this.props.recipient != ''
    const {loading, connected} = this.state
    return (
      <Box
        display="flex"
        flexDirection="row"
        style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 6, paddingRight: 8}}
      >
        {!loading && !connected && (
          <Button
            color="primary"
            variant="outlined"
            onClick={this.start}
            disabled={!canStart}
            style={{width: 110}}
          >
            Start
          </Button>
        )}
        {(loading || connected) && (
          <Button color="secondary" variant="outlined" onClick={this.close} style={{width: 110}}>
            {this.state.loading ? 'Cancel' : 'Disconnect'}
          </Button>
        )}
      </Box>
    )
  }

  render() {
    const {loading, connected} = this.state

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%', position: 'relative'}}>
        <Header loading={loading} />
        <Divider />
        <Box display="flex" flexDirection="row" style={{paddingTop: 28}}>
          <Box display="flex" flexDirection="column" flex={1}>
            <Box
              display="flex"
              flexDirection="row"
              flex={1}
              style={{paddingLeft: 8, paddingTop: 8, paddingRight: 2}}
            >
              <Typography style={{paddingRight: 4, paddingTop: 2, paddingBottom: 8, width: 40}} align="right">
                To:
              </Typography>
              <Autocomplete
                identity={this.props.recipient}
                disabled={this.state.loading || this.state.connected}
                onChange={this.props.setRecipient}
                keyTypes={[EDX25519, EDX25519Public]}
                style={{width: '100%'}}
                addOptions={true}
              />
            </Box>
            <Divider />

            <Box
              display="flex"
              flexDirection="row"
              flex={1}
              style={{paddingLeft: 8, paddingTop: 8, paddingRight: 2}}
            >
              <Typography style={{paddingRight: 4, paddingTop: 2, paddingBottom: 8, width: 40}} align="right">
                From:
              </Typography>
              <Autocomplete
                identity={this.props.sender}
                disabled={this.state.loading || this.state.connected}
                onChange={this.props.setSender}
                keyTypes={[EDX25519]}
                style={{width: '100%'}}
              />
            </Box>
          </Box>
          {this.renderStartStop()}
        </Box>
        <Divider />
        <div
          ref={this.listRef}
          style={{
            position: 'absolute',
            top: 107,
            bottom: 40,
            left: 0,
            right: 0,
            overflowY: 'auto',
          }}
        >
          {this.state.rows.map((row, index) => this.renderItem(index, 'wormhole-row-' + index))}
        </div>

        <Box
          display="flex"
          flexDirection="column"
          style={{backgroundColor: 'white', position: 'absolute', bottom: 0, left: 0, right: 0}}
        >
          <Divider />
          <TextInputView
            defaultValue=""
            submitEditing={this.submitEditing}
            disabled={!connected}
            placeholder="Type your message..."
            disabledPlaceholder=" "
          />
        </Box>
      </Box>
    )
  }
}

const rowStyle: CSSProperties = {
  margin: 10,
  whiteSpace: 'pre-wrap',
  clear: 'both',
}

const otherStyle: CSSProperties = {
  marginBottom: 2,
  marginTop: 0,
  padding: 10,
  background: '#eee',
  float: 'left',
  display: 'inline-block',
  maxWidth: '60%',
}

const ownerStyle: CSSProperties = {
  marginBottom: 2,
  marginTop: 0,
  padding: 10,
  float: 'right',
  background: '#0084ff',
  color: '#fff',
  display: 'inline-block',
  maxWidth: '60%',
}

export default (_: {}) => {
  const {sender, recipient, messages} = store.useState((s) => ({
    sender: s.sender,
    recipient: s.recipient,
    messages: s.messages,
  }))

  const setRecipient = (recipient?: string) => {
    store.update((s) => {
      s.recipient = recipient || ''
    })
  }
  const setSender = (sender?: string) => {
    store.update((s) => {
      s.sender = sender || ''
    })
  }

  const setMessages = (messages: WormholeMessage[]) => {
    store.update((s) => {
      s.messages = messages
    })
  }

  return (
    <WormholeView
      sender={sender}
      recipient={recipient}
      messages={messages}
      setSender={setSender}
      setRecipient={setRecipient}
      setMessages={setMessages}
    />
  )
}
