import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  IconButton,
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

import {Add as AddIcon} from '@material-ui/icons'

import {styles} from '../../components'
import UserLabel from '../user/label'
import {IDView} from '../key/view'

import {store} from '../../store'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'

import {Key, KeyType, SortDirection} from '../../rpc/types'
import {appStatus, keys, RPCError, RPCState} from '../../rpc/rpc'
import {AppStatusRequest, AppStatusResponse, KeysRequest, KeysResponse} from '../../rpc/types'
import {AppState} from '../../reducers/app'

type Props = {
  keys: Array<Key>
  sortField: string
  sortDirection: SortDirection
  intro: boolean
}

type State = {
  newKeyMenuEl: HTMLButtonElement
  openCreate: string // '' | 'NEW' | 'INTRO'
  openImport: boolean
}

class KeysView extends React.Component<Props, State> {
  state = {
    newKeyMenuEl: null,
    openCreate: '',
    openImport: false,
  }

  componentDidMount() {
    this.promptStatus()
    this.refresh()
  }

  refresh = () => {
    this.list(this.props.sortField, this.props.sortDirection)
  }

  list = (sortField: string, sortDirection: SortDirection) => {
    console.log('List keys', sortField, sortDirection)
    const req: KeysRequest = {
      query: '',
      sortField: sortField,
      sortDirection: sortDirection,
    }
    store.dispatch(keys(req))
  }

  onChange = () => {
    this.refresh()
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
    this.list(field, direction)
  }

  openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({newKeyMenuEl: event.currentTarget})
  }

  closeMenu = () => {
    this.setState({newKeyMenuEl: null})
  }

  keyGen = () => {
    this.closeMenu()
    this.setState({openCreate: 'NEW'})
  }

  promptStatus = () => {
    store.dispatch(
      appStatus({}, (resp: AppStatusResponse) => {
        this.setState({openCreate: resp.promptKeygen && this.props.intro ? 'INTRO' : ''})
      })
    )
  }

  importKey = () => {
    this.closeMenu()
    this.setState({openImport: true})
    //store.dispatch(push('/keys/key/import'))
  }

  closeImport = (imported: boolean) => {
    this.setState({openImport: false})
    this.refresh()
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
          // startIcon={<AddIcon />}
        >
          Add Key
        </Button>
        <Menu
          id="new-key-menu"
          anchorEl={this.state.newKeyMenuEl}
          keepMounted
          open={!!this.state.newKeyMenuEl}
          onClose={this.closeMenu}
        >
          <MenuItem onClick={this.keyGen}>
            <Typography>Generate Key</Typography>
          </MenuItem>
          <MenuItem onClick={this.importKey}>
            <Typography>Import Key</Typography>
          </MenuItem>
        </Menu>
      </Box>
    )
  }

  render() {
    const {sortField, sortDirection} = this.props
    const direction = directionString(sortDirection)

    console.log('Open (create):', this.state.openCreate)

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
                  active={sortField === 'kid'}
                  direction={direction}
                  onClick={() => this.sort(sortField, 'kid', sortDirection)}
                >
                  <Typography style={{...styles.mono}}>ID</Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'user'}
                  direction={direction}
                  onClick={() => this.sort(sortField, 'user', sortDirection)}
                >
                  <Typography style={{...styles.mono}}>User</Typography>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.keys.map((key, index) => {
              return (
                <TableRow hover onClick={event => this.select(key)} key={key.id} style={{cursor: 'pointer'}}>
                  <TableCell style={{verticalAlign: 'top', width: 520}}>
                    <IDView id={key.id} owner={key.type == KeyType.X25519 || key.type === KeyType.EDX25519} />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {key.user && <UserLabel kid={key.id} user={key.user} />}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <KeyCreateDialog
          open={this.state.openCreate != ''}
          close={() => this.setState({openCreate: ''})}
          intro={this.props.intro && this.state.openCreate == 'INTRO'}
          onChange={this.onChange}
        />
        <KeyImportDialog open={this.state.openImport} close={this.closeImport} />
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

const mapStateToProps = (state: {app: AppState; rpc: RPCState}, ownProps: any) => {
  return {
    intro: state.app.intro,
    keys: (state.rpc.keys && state.rpc.keys.keys) || [],
    sortField: (state.rpc.keys && state.rpc.keys.sortField) || '',
    sortDirection: (state.rpc.keys && state.rpc.keys.sortDirection) || 'ASC',
  }
}

export default connect(mapStateToProps)(KeysView)
