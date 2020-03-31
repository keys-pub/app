import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, LinearProgress, Typography, Box} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import {Link, styles} from '../../components'
import Autocomplete from '../keys/autocomplete'

import {store} from '../../store'
import * as grpc from '@grpc/grpc-js'
import {shell} from 'electron'

import TextInputView from '../textinput'

import {generateID} from '../helper'

import {CSSProperties} from '@material-ui/styles'

import {
  WelcomeStatus,
  CanStartStatus,
  ConnectingStatus,
  ConnectedStatus,
  DisconnectedStatus,
  ErrorStatus,
} from './status'

import {WormholeState} from '../../reducers/wormhole'
import {wormhole, rand} from '../../rpc/rpc'
import {
  Key,
  KeyType,
  ContentType,
  Encoding,
  MessageType,
  RPCError,
  RandRequest,
  RandResponse,
  WormholeStatus,
  WormholeInput,
  WormholeOutput,
} from '../../rpc/types'

export type Props = {
  sender: string
  recipient: string
}

type State = {
  loading: boolean
  connected: boolean
  rows: readonly Row[]
}

type Row = {
  id: string
  text?: string
  element?: JSX.Element
  type: RowType
  pending?: boolean
  fade?: boolean
}

enum RowType {
  Sent = 1,
  Received = 2,
  Status = 3,
}

class WormholeView extends React.Component<Props, State> {
  state = {
    loading: false,
    connected: false,
    rows: [],
  }
  private listRef: React.RefObject<HTMLDivElement> = React.createRef()
  private wormhole: (req: WormholeInput, end: boolean) => void

  componentDidMount() {
    const rows = [{id: 'welcome', type: RowType.Status, element: <WelcomeStatus />}]
    this.setState({rows})
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.sender != prevProps.sender || this.props.recipient != prevProps.recipient) {
      if (this.props.recipient && this.props.sender) {
        const rows = [
          {id: 'welcome', type: RowType.Status, element: <WelcomeStatus />},
          {id: 'can-start', type: RowType.Status, element: <CanStartStatus />},
        ]
        this.setState({rows})
      } else {
        const rows = [{id: 'welcome', type: RowType.Status, element: <WelcomeStatus />}]
        this.setState({rows})
      }
    }
  }

  componentWillUnmount() {
    this.close()
  }

  openInvite = () => {}

  setRecipient = (recipient: string) => {
    store.dispatch({type: 'WORMHOLE_RECIPIENT', payload: {recipient}})
  }

  setSender = (sender: string) => {
    store.dispatch({type: 'WORMHOLE_SENDER', payload: {sender}})
  }

  start = async () => {
    console.log('Wormhole start...')

    this.addRow({
      id: 'connecting',
      type: RowType.Status,
      element: <ConnectingStatus recipient={this.props.recipient} />,
    })

    this.setState({loading: true, connected: false})
    this.wormhole = wormhole((err: RPCError, resp: WormholeOutput, done: boolean) => {
      if (err) {
        console.log('wormhole err:', err)
        this.setState({loading: false, connected: false})
        if (err.code == grpc.status.CANCELLED || err.details == 'closed') {
          // Closed
          this.addRow({id: 'disconnected', type: RowType.Status, element: <DisconnectedStatus />})
        } else {
          this.addRow({id: 'error', type: RowType.Status, element: <ErrorStatus error={err.details} />})
        }
        return
      }
      if (resp) {
        console.log('wormhole resp:', resp)

        if (this.state.loading && resp.status == WormholeStatus.WORMHOLE_CONNECTED) {
          this.setState({loading: false, connected: true})
          this.addRow({id: 'connected', type: RowType.Status, element: <ConnectedStatus />})
        }

        if (resp.status == WormholeStatus.WORMHOLE_CLOSED) {
          this.setState({loading: false, connected: false})
          this.addRow({id: 'disconnected', type: RowType.Status, element: <DisconnectedStatus />})
          return
        }

        switch (resp.message?.type) {
          case MessageType.MESSAGE_ACK:
            this.ack(resp.message.id)
            return
        }

        if (resp.message?.content?.data?.length > 0) {
          const text = new TextDecoder().decode(resp.message.content.data)
          this.addRow({id: resp.message.id, text: text, type: RowType.Received})
        }
      }
      if (done) {
        this.setState({loading: false})
      }
    })
    const req: WormholeInput = {
      sender: this.props.sender,
      recipient: this.props.recipient,
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
    }
    // TODO: Check if wormhole closed
    this.wormhole(req, false)
  }

  close = () => {
    // TODO: Check if wormhole already closed
    if (this.wormhole) {
      this.addRowUnlessLast({id: 'disconnected', type: RowType.Status, element: <DisconnectedStatus />})
      this.wormhole(null, true)
      this.wormhole = null
    }
    this.setState({loading: false, connected: false})
  }

  ack = (id: string) => {
    const nextRows = this.state.rows.map((r: Row) => {
      if (r.id == id) {
        r.pending = false
      }
      return r
    })
    this.setState({rows: nextRows})
  }

  rowExists = (row: Row): boolean => {
    return this.state.rows.some((r: Row) => {
      return r.id == row.id
    })
  }

  rowLast = (): Row => {
    if (this.state.rows.length > 0) {
      return this.state.rows[this.state.rows.length - 1]
    }
    return null
  }

  addRowUnlessExists = (row: Row) => {
    if (!this.rowExists(row)) {
      this.addRow(row)
    }
  }

  addRowUnlessLast = (row: Row) => {
    const last = this.rowLast()
    if (last?.id != row.id) {
      this.addRow(row)
    }
  }

  addRow = (row: Row) => {
    const nextRows = [...this.state.rows, row]

    this.setState({
      rows: nextRows,
    })

    this.forceUpdate(() => {
      this.scrollToBottom()
    })
  }

  submitEditing = async (text: string) => {
    if (text == '') {
      return
    }
    const id = await generateID()
    this.addRow({id: id, text: text, type: RowType.Sent, pending: true})
    this.send(id, text)
  }

  scrollToBottom = () => {
    const component = this.listRef.current
    const scrollHeight = component.scrollHeight
    const height = component.clientHeight
    const maxScrollTop = scrollHeight - height
    component.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  renderItem = (index, key) => {
    const row: Row = this.state.rows[index]
    let style
    let className
    switch (row.type) {
      case RowType.Sent:
        style = ownerStyle
        className = 'message-owner'
        break
      case RowType.Received:
        style = otherStyle
        className = 'message-other'
        break
      case RowType.Status:
        style = {}
        className = 'message-status'
        break
    }

    return (
      <Box key={key} className={className} style={{...rowStyle, ...style}}>
        {row.text && <Typography>{row.text}</Typography>}
        {row.element}
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
      <Box style={{height: '100%', overflowX: 'hidden', overflowY: 'hidden', position: 'relative'}}>
        <Divider />
        <Box display="flex" flexDirection="row">
          <Box display="flex" flexDirection="column" flex={1}>
            <Box
              display="flex"
              flexDirection="row"
              flex={1}
              style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 4, paddingRight: 2}}
            >
              <Typography style={{...styles.mono, paddingTop: 3}}>&nbsp;&nbsp;To:&nbsp;</Typography>
              <Autocomplete
                identity={this.props.recipient}
                disabled={this.state.loading || this.state.connected}
                onChange={this.setRecipient}
                keyTypes={[KeyType.EDX25519_PUBLIC, KeyType.EDX25519]}
                style={{width: '100%'}}
              />
            </Box>
            <Divider />

            <Box
              display="flex"
              flexDirection="row"
              flex={1}
              style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 4, paddingRight: 2}}
            >
              <Typography style={{...styles.mono, paddingTop: 3}}>From:&nbsp;</Typography>
              <Autocomplete
                identity={this.props.sender}
                disabled={this.state.loading || this.state.connected}
                onChange={this.setSender}
                keyTypes={[KeyType.EDX25519]}
                style={{width: '100%'}}
              />
            </Box>
          </Box>
          {this.renderStartStop()}
        </Box>
        {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}
        <div ref={this.listRef} style={{height: 'calc(100vh - 151px)', overflowY: 'scroll'}}>
          {' '}
          {/* <ReactList
            ref={this.listRef}
            itemRenderer={this.renderItem}
            length={this.state.rows.length}
            type="simple"
          /> */}
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

const mapStateToProps = (state: {wormhole: WormholeState; router: any}, ownProps: any) => {
  return {
    sender: state.wormhole.sender || '',
    recipient: state.wormhole.recipient || '',
  }
}
export default connect(mapStateToProps)(WormholeView)
