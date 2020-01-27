import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@material-ui/core'

import {styles} from '../../components'
import {NameView} from '../user/views'
import {IDView} from '../key/view'

import {keys} from '../../rpc/rpc'

import {store} from '../../store'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import {Key, KeyType, SortDirection} from '../../rpc/types'
import {RPCError, RPCState} from '../../rpc/rpc'
import {KeysRequest, KeysResponse} from '../../rpc/types'

type Props = {
  keys: Array<Key>
  sortField: string
  sortDirection: SortDirection
}

type State = {
  newKeyMenuEl: HTMLButtonElement
}

class KeysView extends React.Component<Props, State> {
  state = {
    newKeyMenuEl: null,
  }

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
    store.dispatch(keys(req))
  }

  select = (key: Key) => {
    store.dispatch(push('/keys/key/index?kid=' + key.id))
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

  openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({newKeyMenuEl: event.currentTarget})
  }

  closeMenu = () => {
    this.setState({newKeyMenuEl: null})
  }

  keyGen = (typ: KeyType) => {
    this.closeMenu()
    store.dispatch(push('/keys/key/create?type=' + typ))
  }

  importKey = () => {
    this.closeMenu()
    store.dispatch(push('/keys/key/import'))
  }

  renderHeader() {
    return (
      <Box display="flex" flexDirection="row" style={{paddingLeft: 8, paddingTop: 8, paddingBottom: 8}}>
        <Button
          aria-controls="new-key-menu"
          aria-haspopup="true"
          color="primary"
          variant="outlined"
          size="small"
          onClick={this.openMenu}
        >
          New Key
        </Button>
        <Menu
          id="new-key-menu"
          anchorEl={this.state.newKeyMenuEl}
          keepMounted
          open={!!this.state.newKeyMenuEl}
          onClose={this.closeMenu}
        >
          <MenuItem onClick={() => this.keyGen(KeyType.ED25519)}>
            <Typography>
              Signing/Encryption&nbsp;
              <span style={{color: '#999'}}>&nbsp;(ed25519)</span>
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => this.keyGen(KeyType.CURVE25519)}>
            <Typography>
              Encryption
              <span style={{color: '#999'}}>&nbsp;(curve25519)</span>
            </Typography>
          </MenuItem>
          <MenuItem onClick={this.importKey}>
            <Typography>Import</Typography>
          </MenuItem>
        </Menu>
      </Box>
    )
  }

  render() {
    const {sortField, sortDirection} = this.props
    const direction = directionString(sortDirection)

    return (
      <Box>
        <Divider />
        {this.renderHeader()}
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
                    {key.user && <NameView user={key.user} />}
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDView
                      id={key.id}
                      owner={key.type == KeyType.CURVE25519 || key.type === KeyType.ED25519}
                    />
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
