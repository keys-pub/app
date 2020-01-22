import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@material-ui/core'

import {styles} from '../../components'
import {NamesView} from '../user/views'
import {IDView} from '../key/view'

import {keys} from '../../rpc/rpc'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import {Key, SortDirection} from '../../rpc/types'
import {RPCError, RPCState} from '../../rpc/rpc'
import {KeysRequest, KeysResponse} from '../../rpc/types'

type Props = {
  keys: Array<Key>
  sortField: string
  sortDirection: SortDirection
  dispatch: (action: any) => any
}

class KeysView extends React.Component<Props> {
  componentDidMount() {
    this.refresh(this.props.sortField, this.props.sortDirection)
  }

  refresh = (sortField: string, sortDirection: SortDirection) => {
    console.log('Refresh', sortField, sortDirection)
    const req: KeysRequest = {
      query: '',
      sortField: sortField,
      sortDirection: sortDirection,
    }
    this.props.dispatch(keys(req))
  }

  select = (key: Key) => {
    this.props.dispatch(push('/key/index?kid=' + key.id))
  }

  sort = (sortField: string, field: string, sortDirection: SortDirection) => {
    const active = sortField === field
    let direction: SortDirection = sortDirection
    if (active) {
      direction = flipDirection(sortDirection)
    } else {
      direction = SortDirection.ASC
    }
    this.refresh(field, direction)
  }

  render() {
    const {sortField, sortDirection} = this.props
    const direction = directionString(sortDirection)

    return (
      <Box>
        <Divider />
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'user'}
                  direction={direction}
                  onClick={() => this.sort(sortField, 'user', sortDirection)}
                >
                  <Typography style={{...styles.mono}}>User</Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'kid'}
                  direction={direction}
                  onClick={() => this.sort(sortField, 'kid', sortDirection)}
                >
                  <Typography style={{...styles.mono}}>ID</Typography>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.keys.map((key, index) => {
              return (
                <TableRow hover onClick={event => this.select(key)} key={key.id} style={{cursor: 'pointer'}}>
                  <TableCell component="th" scope="row">
                    <NamesView users={key.users || []} />
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDView id={key.id} owner={key.isPrivate} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>
    )
  }
}

const directionString = (d: SortDirection): 'asc' | 'desc' => {
  switch (d) {
    case 'ASC':
      return 'asc'
    case 'DESC':
      return 'desc'
  }
  return 'asc'
}

const flipDirection = (d: SortDirection): SortDirection => {
  switch (d) {
    case SortDirection.ASC:
      return SortDirection.DESC
    case SortDirection.DESC:
      return SortDirection.ASC
  }
  return SortDirection.ASC
}

const cellStyles = {
  paddingTop: 4,
  paddingBottom: 8,
  paddingLeft: 8,
  paddingRight: 5,
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  return {
    keys: (state.rpc.keys && state.rpc.keys.keys) || [],
    sortField: (state.rpc.keys && state.rpc.keys.sortField) || '',
    sortDirection: (state.rpc.keys && state.rpc.keys.sortDirection) || 'ASC',
  }
}

export default connect(mapStateToProps)(KeysView)
