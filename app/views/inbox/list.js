// @flow
import React, {Component} from 'react'

import {Avatar, Box, CircularProgress, Typography} from '@material-ui/core'

// $FlowFixMe
import {AutoSizer, CellMeasurer, CellMeasurerCache} from 'react-virtualized'
// $FlowFixMe
import {List} from 'immutable'

import RList from '../components/list'

import Row from './row'
import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import {inboxRows} from './actions'
import {inbox} from '../../rpc/rpc'

import type {Inbox, InboxRequest} from '../../rpc/types'
import type {InboxRow} from './types'
import type {State} from '../state'

type Props = {
  rows: List<InboxRow>,
  dispatch: (action: any) => any,
}

class InboxList extends Component<Props> {
  listRef: any

  select = (inbox: Inbox) => {
    this.props.dispatch({type: 'SELECT_KID', payload: {selectedAddress: inbox.kid}})
    this.props.dispatch(push('/inbox'))
  }

  selectRow = (row: InboxRow, index: number) => {
    console.log('Select row', row)
    if (!row.inbox) return
    this.select(row.inbox)
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    this.listRef.forceUpdate()
  }

  rowRenderer = (index: number) => {
    const row: ?InboxRow = this.props.rows.get(index)
    if (!row) return null
    return <Row row={row} index={index} selectRow={this.selectRow} />
  }

  setListRef = (ref: any) => {
    this.listRef = ref
  }

  render() {
    return (
      <Box
        display="flex"
        flex={1}
        style={{overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#2f3136'}}
      >
        <RList
          ref={this.setListRef}
          renderItem={this.rowRenderer}
          rowCount={this.props.rows.size}
          isActive={false}
        />
      </Box>
    )
  }
}

const mapStateToProps = (state: State, ownProps: any) => {
  const rows: List<InboxRow> = inboxRows(state.rpc, state.app.selectedInbox)
  return {
    rows,
  }
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(InboxList)
