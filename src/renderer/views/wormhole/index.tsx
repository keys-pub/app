import * as React from 'react'

import {Button, Divider, Input, LinearProgress, Typography, Box} from '@material-ui/core'

import Alert, {Color as AlertColor} from '@material-ui/lab/Alert'

import {Link, styles} from '../../components'
import Autocomplete from '../keys/autocomplete'

import * as grpc from '@grpc/grpc-js'
import {shell} from 'electron'

import TextInputView from '../textinput'

import {generateID} from '../helper'

import {CSSProperties} from '@material-ui/styles'

import {
  welcomeStatus,
  canStartStatus,
  connectingStatus,
  connectedStatus,
  disconnectedStatus,
  errorStatus,
} from './status'

import {WormholeState, WormholeMessage, WormholeMessageType, WormholeStore as Store} from '../../store/pull'
import {wormhole, rand, WormholeEvent} from '../../rpc/keys'
import {
  KeyType,
  ContentType,
  MessageType,
  WormholeStatus,
  WormholeInput,
  WormholeOutput,
} from '../../rpc/keys.d'

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
  private wormhole?: (req?: WormholeInput, end?: boolean) => void

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
    this.wormhole = wormhole((event: WormholeEvent) => {
      const {err, res, done} = event
      if (err) {
        this.setState({loading: false, connected: false})
        if (err.code == grpc.status.CANCELLED || err.message == 'closed') {
          // Closed
          this.addRow(disconnectedStatus())
        } else {
          this.addRow(errorStatus(err.message))
        }
        return
      }
      if (res) {
        if (this.state.loading && res.status == WormholeStatus.WORMHOLE_CONNECTED) {
          this.setState({loading: false, connected: true})
          this.addRow(connectedStatus())
        }

        if (res.status == WormholeStatus.WORMHOLE_CLOSED) {
          this.setState({loading: false, connected: false})
          this.addRow(disconnectedStatus())
          return
        }

        switch (res.message?.type) {
          case MessageType.MESSAGE_ACK:
            this.ack(res.message.id!)
            return
        }

        if (res.message!.content!.data!.length! > 0) {
          const text = new TextDecoder().decode(res.message!.content!.data!)
          this.addRow({id: res.message!.id!, text: text, type: WormholeMessageType.Received})
        }
      }
      if (done) {
        this.setState({loading: false})
      }
    })
    const req: WormholeInput = {
      sender: this.props.sender,
      recipient: this.props.recipient,
      invite: '',
      id: '',
      data: new Uint8Array(),
      type: ContentType.UTF8_CONTENT,
    }
    console.log('Wormhole request:', req)
    this.wormhole(req, false)
  }

  send = (id: string, text: string) => {
    if (text == '') {
      return
    }
    if (!this.wormhole) {
      return
    }
    const data = new TextEncoder().encode(text)
    const req: WormholeInput = {
      id: id,
      data: data,
      type: ContentType.UTF8_CONTENT,
      sender: this.props.sender,
      recipient: this.props.recipient,
      invite: '',
    }
    // TODO: Check if wormhole closed
    this.wormhole(req, false)
  }

  close = () => {
    // TODO: Check if wormhole already closed
    if (this.wormhole) {
      this.addRowUnlessLast(disconnectedStatus())
      this.wormhole(undefined, true)
      this.wormhole = undefined
    }
    this.setState({loading: false, connected: false})
  }

  ack = (id: string) => {
    const nextRows = this.state.rows.map((r: WormholeMessage) => {
      if (r.id == id) {
        r.pending = false
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
    const canStart = this.props.sender != '' && this.props.recipient != ''
    const {loading, connected} = this.state

    return (
      <Box display="flex" flexDirection="column" style={{height: '100%'}}>
        <Box display="flex" flexDirection="row">
          <Box display="flex" flexDirection="column" flex={1}>
            <Box
              display="flex"
              flexDirection="row"
              flex={1}
              style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 4, paddingRight: 2}}
            >
              <Typography style={{paddingTop: 2, paddingRight: 4, width: 40}} align="right">
                To:
              </Typography>
              <Autocomplete
                identity={this.props.recipient}
                disabled={this.state.loading || this.state.connected}
                onChange={this.props.setRecipient}
                keyTypes={[KeyType.EDX25519_PUBLIC, KeyType.EDX25519]}
                style={{width: '100%'}}
                addOptions={true}
              />
            </Box>
            <Divider />

            <Box
              display="flex"
              flexDirection="row"
              flex={1}
              style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 4, paddingRight: 2}}
            >
              <Typography style={{paddingTop: 2, paddingRight: 4, width: 40}} align="right">
                From:
              </Typography>
              <Autocomplete
                identity={this.props.sender}
                disabled={this.state.loading || this.state.connected}
                onChange={this.props.setSender}
                keyTypes={[KeyType.EDX25519]}
                style={{width: '100%'}}
              />
            </Box>
          </Box>
          {this.renderStartStop()}
        </Box>
        {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}
        <div ref={this.listRef} style={{display: 'flex', minHeight: '100%', overflowY: 'scroll'}}>
          {this.state.rows.map((row, index) => this.renderItem(index, 'wormhole-row-' + index))}
        </div>

        <Box
          display="flex"
          flexDirection="column"
          style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white'}}
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

export default (props: {}) => {
  const {sender, recipient, messages} = Store.useState((s) => ({
    sender: s.sender,
    recipient: s.recipient,
    messages: s.messages,
  }))

  const setRecipient = (recipient?: string) => {
    Store.update((s) => {
      s.recipient = recipient || ''
    })
  }
  const setSender = (sender?: string) => {
    Store.update((s) => {
      s.sender = sender || ''
    })
  }

  const setMessages = (messages: WormholeMessage[]) => {
    Store.update((s) => {
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
