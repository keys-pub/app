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

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Publish as ExportIcon,
  DataUsage as GenerateKeyIcon,
  ArrowDownward as ImportKeyIcon,
  Search as SearchIcon,
  Sync as SyncIcon,
} from '@material-ui/icons'

import Alert, {Color as AlertColor} from '@material-ui/lab/Alert'

import {styles, Snack, SnackOpts} from '../../components'
import UserLabel from '../user/label'
import {IDView} from '../key/content'

import {store} from '../../store'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'
import KeyRemoveDialog from '../key/remove'
import KeyExportDialog from '../export'
import KeyDialog from '../key'
import SearchDialog from '../search/dialog'
import {directionString, flipDirection} from '../helper'

import {keys, vaultUpdate} from '../../rpc/keys'
import {
  RPCError,
  Key,
  KeyType,
  SortDirection,
  KeysRequest,
  KeysResponse,
  VaultUpdateRequest,
  VaultUpdateResponse,
} from '../../rpc/keys.d'
import {AppState} from '../../reducers/app'

type Props = {
  intro: boolean
}

type Position = {
  x: number
  y: number
}

type State = {
  contextPosition: Position
  keys: Array<Key>
  sortField: string
  sortDirection: SortDirection
  input: string
  newKeyMenuEl: HTMLButtonElement
  openCreate: string // '' | 'NEW' | 'INTRO'
  openExport: string
  openImport: boolean
  openKey: string
  openRemove: OpenRemove
  openSearch: boolean
  openSnack: SnackOpts
  selected: string
  syncing: boolean
}

type OpenRemove = {
  open: boolean
  key: Key
}

class KeysView extends React.Component<Props, State> {
  state = {
    contextPosition: null,
    keys: [],
    sortField: '',
    sortDirection: 'ASC' as SortDirection,
    input: '',
    newKeyMenuEl: null,
    openCreate: '',
    openExport: '',
    openImport: false,
    openKey: '',
    openRemove: {open: false, key: null},
    openSearch: false,
    openSnack: null,
    selected: '',
    syncing: false,
  }

  componentDidMount() {
    this.reload()
  }

  reload = () => {
    this.list(this.state.input, this.state.sortField, this.state.sortDirection)
  }

  sync = () => {
    this.setState({syncing: true})
    const req: VaultUpdateRequest = {}
    vaultUpdate(req, (err: RPCError, resp: VaultUpdateResponse) => {
      this.setState({syncing: false})
      if (err) {
        this.setState({openSnack: {message: err.details, alert: 'error'}})
      }
      this.reload()
    })
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
    this.reload()
  }

  select = (key: Key) => {
    //store.dispatch(push('/keys/key/index?kid=' + key.id))
    this.setState({openKey: key.id, selected: key.id})
  }

  isSelected = (kid: string) => {
    return this.state.selected == kid
  }

  onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const kid = event.currentTarget.id
    this.setState({
      contextPosition: {x: event.clientX - 2, y: event.clientY - 4},
      selected: kid,
    })
  }

  closeContext = () => {
    this.setState({contextPosition: null, selected: ''})
  }

  export = () => {
    this.setState({contextPosition: null, openExport: this.state.selected})
  }

  delete = () => {
    const key: Key = this.state.keys.find((k: Key) => {
      return this.state.selected == k.id
    })

    this.setState({contextPosition: null, openRemove: {open: true, key}})
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
    this.reload()
  }

  searchKey = () => {
    this.closeMenu()
    this.setState({openSearch: true})
  }

  closeSearch = () => {
    this.setState({openSearch: false})
    this.reload()
  }

  closeRemove = (removed: boolean) => {
    this.setState({openRemove: {open: false, key: this.state.openRemove.key}, selected: ''})
    this.reload()
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
          color="primary"
          variant="outlined"
          size="small"
          onClick={this.keyGen}
          style={{marginTop: 2, minWidth: 90}}
          startIcon={<AddIcon />}
        >
          New
        </Button>
        <Box paddingLeft={1} />
        <Button
          // color="primary"
          variant="outlined"
          size="small"
          onClick={this.importKey}
          style={{marginTop: 2, minWidth: 90}}
          startIcon={<ImportKeyIcon />}
        >
          Import
        </Button>
        <Box paddingLeft={1} />
        <Button
          // color="primary"
          variant="outlined"
          size="small"
          onClick={this.searchKey}
          style={{marginTop: 2, minWidth: 90}}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
        <Box paddingLeft={1} />
        <Button
          onClick={this.sync}
          size="small"
          variant="outlined"
          style={{marginTop: 2, minWidth: 'auto'}}
          disabled={this.state.syncing}
        >
          <SyncIcon />
        </Button>
        <Box display="flex" flexDirection="row" flexGrow={1} />
        <TextField
          placeholder="Filter"
          variant="outlined"
          value={this.state.input}
          onChange={this.onInputChange}
          inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
          style={{marginTop: 2, width: 300, marginRight: 10}}
        />
        <Menu
          id="new-key-menu"
          anchorEl={this.state.newKeyMenuEl}
          keepMounted
          open={!!this.state.newKeyMenuEl}
          onClose={this.closeMenu}
        >
          <MenuItem onClick={this.keyGen}>
            <GenerateKeyIcon />
            <Typography style={{marginLeft: 10}}>Generate Key</Typography>
          </MenuItem>
          <MenuItem onClick={this.importKey}>
            <ImportKeyIcon />
            <Typography style={{marginLeft: 10}}>Import Key</Typography>
          </MenuItem>
        </Menu>
        <SearchDialog open={this.state.openSearch} close={this.closeSearch} />
      </Box>
    )
  }

  render() {
    const {sortField, sortDirection} = this.state
    const direction = directionString(sortDirection)

    return (
      <Box>
        <Menu
          keepMounted
          open={this.state.contextPosition !== null}
          onClose={this.closeContext}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.contextPosition !== null
              ? {top: this.state.contextPosition.y, left: this.state.contextPosition.x}
              : undefined
          }
        >
          <MenuItem onClick={this.export}>
            <ExportIcon />
            <Typography style={{marginLeft: 10, marginRight: 20}}>Export</Typography>
          </MenuItem>
          <MenuItem color="secondary" onClick={this.delete}>
            <DeleteIcon />
            <Typography style={{marginLeft: 10, marginRight: 20}}>Delete</Typography>
          </MenuItem>
        </Menu>
        <Divider />
        {this.renderHeader()}
        <Divider />
        <Box style={{height: 'calc(100vh - 84px)', overflowY: 'auto'}}>
          <Table size="small">
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
                    <Typography style={{...styles.mono}}>Key</Typography>
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.keys.map((key, index) => {
                return (
                  <TableRow
                    hover
                    onClick={(event) => this.select(key)}
                    key={key.id}
                    style={{cursor: 'pointer'}}
                    selected={this.isSelected(key.id)}
                    component={(props: any) => {
                      return <tr onContextMenu={this.onContextMenu} {...props} id={key.id} />
                    }}
                  >
                    <TableCell component="th" scope="row" style={{minWidth: 200}}>
                      {key.user && <UserLabel kid={key.id} user={key.user} />}
                    </TableCell>
                    <TableCell style={{verticalAlign: 'top'}}>
                      <IDView
                        id={key.id}
                        owner={key.type == KeyType.X25519 || key.type === KeyType.EDX25519}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
        <KeyCreateDialog
          open={this.state.openCreate != ''}
          close={() => this.setState({openCreate: ''})}
          onChange={this.onChange}
        />
        <KeyImportDialog open={this.state.openImport} close={this.closeImport} />
        <KeyRemoveDialog
          open={this.state.openRemove.open}
          keyRemove={this.state.openRemove.key}
          close={this.closeRemove}
        />
        <KeyExportDialog
          open={this.state.openExport != ''}
          kid={this.state.openExport}
          close={() => this.setState({openExport: '', selected: ''})}
        />
        <KeyDialog
          open={this.state.openKey != ''}
          close={() => this.setState({openKey: '', selected: ''})}
          kid={this.state.openKey}
          reload={this.reload}
        />
        <Snack
          open={!!this.state.openSnack}
          onClose={() => this.setState({openSnack: null})}
          message={this.state.openSnack?.message}
          alert={this.state.openSnack?.alert}
          duration={this.state.openSnack?.duration}
        />
      </Box>
    )
  }
}

const mapStateToProps = (state: {app: AppState}, ownProps: any) => {
  return {
    intro: state.app.intro,
  }
}

export default connect(mapStateToProps)(KeysView)
