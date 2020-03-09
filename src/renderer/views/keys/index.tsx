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
  TextField,
  Typography,
} from '@material-ui/core'

import {Add as AddIcon} from '@material-ui/icons'

import {styles} from '../../components'
import UserLabel from '../user/label'
import {IDView} from '../key/content'

import {store} from '../../store'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'

import {keys} from '../../rpc/rpc'
import {RPCError, Key, KeyType, SortDirection, KeysRequest, KeysResponse} from '../../rpc/types'
import {AppState} from '../../reducers/app'

type Props = {
  intro: boolean
}

type State = {
  keys: Array<Key>
  sortField: string
  sortDirection: SortDirection
  input: string
  newKeyMenuEl: HTMLButtonElement
  openCreate: string // '' | 'NEW' | 'INTRO'
  openImport: boolean
}

class KeysView extends React.Component<Props, State> {
  state = {
    keys: [],
    sortField: '',
    sortDirection: 'ASC' as SortDirection,
    input: '',
    newKeyMenuEl: null,
    openCreate: '',
    openImport: false,
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.list(this.state.input, this.state.sortField, this.state.sortDirection)
  }

  list = (query: string, sortField: string, sortDirection: SortDirection) => {
    console.log('List keys', query, sortField, sortDirection)
    const req: KeysRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
    }
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({
        keys: resp.keys,
        sortField: resp.sortField,
        sortDirection: resp.sortDirection,
      })
      // If we don't have keys and intro, then show create dialog
      if (resp.keys.length == 0 && this.props.intro) {
        this.setState({openCreate: 'INTRO'})
      }
    })
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
    this.list(this.state.input, field, direction)
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

  importKey = () => {
    this.closeMenu()
    this.setState({openImport: true})
    //store.dispatch(push('/keys/key/import'))
  }

  closeImport = (imported: boolean) => {
    this.setState({openImport: false})
    this.refresh()
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      input: target.value,
    })
    this.list(target.value, this.state.sortField, this.state.sortDirection)
  }

  renderHeader() {
    return (
      <Box
        display="flex"
        flexDirection="row"
        flex={1}
        style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 8}}
      >
        <Button
          aria-controls="new-key-menu"
          aria-haspopup="true"
          color="primary"
          variant="outlined"
          size="small"
          onClick={this.openMenu}
          style={{height: 32, marginTop: 2}}
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
        <Box paddingLeft={1} />
        <TextField
          placeholder="Search"
          variant="outlined"
          value={this.state.input}
          onChange={this.onInputChange}
          inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
          style={{marginTop: 2, width: 500}}
        />
      </Box>
    )
  }

  render() {
    const {sortField, sortDirection} = this.state
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
            {this.state.keys.map((key, index) => {
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

const mapStateToProps = (state: {app: AppState}, ownProps: any) => {
  return {
    intro: state.app.intro,
  }
}

export default connect(mapStateToProps)(KeysView)
