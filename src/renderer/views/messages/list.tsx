import * as React from 'react'

import {Box, CircularProgress} from '@material-ui/core'

import MessageView from './message'

import RList from '../../components/list'

import {messages} from '../../rpc/keys'
import {RPCError, Message, MessagesRequest, MessagesResponse} from '../../rpc/service.keys.d'
import {MessageRow} from './types'

type Props = {
  kid: string
  rowCount: number
  // select: (r: MessageRow) => void,
}

type State = {
  loaded: boolean
  rowCount: number
}

type ScrollPosition = {
  scrollTop: number
  lockToBottom: boolean
}

// TODO: Handle scrolling back rows
const MaxDisplayCount = 1000

export default class MessagesListView extends React.Component<Props, State> {
  list: Array<MessageRow> = []
  listRef: any
  nextIndex: number = 0
  selectedIndex: number = -1
  scrollPositions: Map<string, ScrollPosition> = new Map()

  state = {
    loaded: false,
    rowCount: 0,
  }

  componentDidMount() {
    this.loadAllRows(this.props.rowCount)
  }

  componentWillUnmount() {
    this.listRef = null
  }

  componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
    if (this.props.kid !== prevProps.kid) {
      this.clear()
      this.loadAllRows(this.props.rowCount)
    } else if (this.props.rowCount !== prevProps.rowCount) {
      console.log('Row count update %d !== %d (%d)', prevProps.rowCount, this.props.rowCount, this.nextIndex)
      this.loadRows(this.nextIndex)
    }
  }

  clear = () => {
    console.log('Message list clear')
    this.list = []
    this.nextIndex = 0
    this.setState({
      loaded: false,
      rowCount: 0,
    })
  }

  rowRenderer = (index: number) => {
    let messageRow: MessageRow | void = this.list[index]
    if (!messageRow || !messageRow.message) {
      console.warn('No message row for index=%d', index)
      return null
    }
    return (
      <MessageView row={messageRow} index={index} selectMessage={this.selectMessage} follow={this.follow} />
    )
  }

  selectMessage = (r: MessageRow, index: number) => {
    let selectedRow: MessageRow | void = this.list[this.selectedIndex]
    if (selectedRow) selectedRow.selected = false
    if (this.selectedIndex === index) {
      this.selectedIndex = -1
      this.listRef.forceUpdate()
      return
    }
    this.selectedIndex = index
    selectedRow = this.list[this.selectedIndex]
    if (selectedRow) {
      selectedRow.selected = true
    }
    this.listRef.forceUpdate()
    if (this.selectedIndex === this.list.length - 1) {
      console.log('Selected last item')
      setTimeout(() => {
        this.listRef.scrollToBottom()
      })
    }
  }

  follow = (r: MessageRow, index: number) => {
    console.log('Follow:', r)
  }

  loadAllRows = (rowCount: number) => {
    let start = 0
    if (this.props.rowCount > MaxDisplayCount) {
      start = this.props.rowCount - MaxDisplayCount
    }
    console.log('Load all rows, index:', start)
    this.loadRows(start)
  }

  loadRows = (index: number) => {
    if (!this.props.kid) {
      console.error('No inbox address')
      return
    }
    const req: MessagesRequest = {
      // kid: this.props.kid,
    }
    console.log('Load rows, RPC messages:', req)
    messages(req, (err: RPCError, resp: MessagesResponse) => {
      if (err) {
        // TODO: error
        return
      }
      if (this.listRef === null) {
        // console.error('No list ref')
        return
      }
      if (!resp.messages) {
        this.setState({loaded: true, rowCount: this.props.rowCount})
        return
      }

      const last = this.list[this.list.length - 1]
      let pending = false
      let pendingInResponse = false
      if (last && last.pending) {
        pending = true
        for (const m of resp.messages) {
          if (m.id === last.message.id) {
            pendingInResponse = true
            break
          }
        }
      }
      if (pending && !pendingInResponse) {
        console.error('Pending message, but failed to get pending in response', pending)
        return
      }

      let i: number = index
      for (const m of resp.messages) {
        this.list[i++] = {message: m}
      }

      this.nextIndex = this.props.rowCount
      this.setState({
        loaded: true,
        rowCount: this.props.rowCount,
      })

      this.listRef.forceUpdate()

      const sp: ScrollPosition | void = this.scrollPositions.get(this.props.kid)
      console.log('Scroll position:', sp)

      if (!sp || sp.lockToBottom) {
        this.listRef.scrollToBottom()
      } else {
        this.listRef.scrollTop(sp.scrollTop)
      }
    })
  }

  onScroll = (e: any) => {
    const t = e.target
    if (t.scrollTop == 0) {
      return
    }
    const lockToBottom = t.scrollHeight - t.scrollTop - 20 <= t.clientHeight
    const sp: ScrollPosition = {scrollTop: t.scrollTop, lockToBottom}
    this.scrollPositions.set(this.props.kid, sp)
  }

  setPending(m: Message) {
    console.log('Set pending:', m)
    this.list[this.list.length] = {
      message: m,
      pending: true,
    }
    this.setState({
      rowCount: this.props.rowCount + 1,
    })
    this.listRef.forceUpdate()
    this.listRef.scrollToBottom()
  }

  setListRef = (ref: any) => {
    this.listRef = ref
  }

  render() {
    return (
      <Box display="flex" flex={1}>
        <Box display="flex" flex={1} style={{overflowY: 'scroll'}}>
          <RList
            ref={this.setListRef}
            renderItem={this.rowRenderer}
            rowCount={this.state.rowCount}
            isActive={false}
            onScroll={this.onScroll}
          />
        </Box>
        {!this.state.loaded && (
          <Box
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              backgroundColor: 'white',
            }}
          >
            <Box display="flex" flex={1} justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          </Box>
        )}
      </Box>
    )
  }
}
