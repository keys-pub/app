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

import {styles} from '../../components'
import Snack, {SnackProps} from '../../components/snack'
import UserLabel from '../user/label'
import {IDView} from '../key/content'

import {store} from '../../store'

import Header from '../header'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'
import KeyRemoveDialog from '../key/remove'
import KeyExportDialog from '../export'
import KeyDialog from '../key'
import SearchDialog from '../search/dialog'
import {directionString, flipDirection} from '../helper'

import {keys, runtimeStatus, vaultUpdate} from '../../rpc/keys'
import {
  Key,
  KeyType,
  SortDirection,
  KeysRequest,
  KeysResponse,
  RuntimeStatusRequest,
  RuntimeStatusResponse,
  VaultUpdateRequest,
  VaultUpdateResponse,
} from '../../rpc/keys.d'

type Props = {
  intro?: boolean
}

type Position = {
  x: number
  y: number
}

type State = {
  contextPosition?: Position
  keys: Key[]
  sortField?: string
  sortDirection?: SortDirection
  input: string
  keyMenuRef?: HTMLButtonElement
  openCreate: string // '' | 'NEW' | 'INTRO'
  openExport: string
  openImport: boolean
  openKey: string
  openRemove?: Key
  openSearch: boolean
  snack?: SnackProps
  snackOpen: boolean
  selected: string
  syncEnabled: boolean
  syncing: boolean
}

class KeysView extends React.Component<Props, State> {
  state: State = {
    keys: [],
    input: '',
    openCreate: '',
    openExport: '',
    openImport: false,
    openKey: '',
    openSearch: false,
    snackOpen: false,
    selected: '',
    syncEnabled: false,
    syncing: false,
  }

  componentDidMount() {
    this.reload()
  }

  snackErr = (err: Error) => {
    this.setState({snack: {message: err.message, alert: 'error'}, snackOpen: true})
  }

  reload = () => {
    const req: RuntimeStatusRequest = {}
    runtimeStatus(req)
      .then((resp: RuntimeStatusResponse) => {
        this.setState({syncEnabled: !!resp.sync})
        this.list(this.state.input, this.state.sortField, this.state.sortDirection)
      })
      .catch(this.snackErr)
  }

  sync = () => {
    this.setState({syncing: true})
    const req: VaultUpdateRequest = {}
    vaultUpdate(req)
      .then((resp: VaultUpdateResponse) => {
        this.reload()
      })
      .finally(() => {
        this.setState({syncing: false})
      })
      .catch(this.snackErr)
  }

  list = (query: string, sortField?: string, sortDirection?: SortDirection) => {
    console.log('List keys', query, sortField, sortDirection)
    const req: KeysRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
      types: [],
    }
    keys(req)
      .then((resp: KeysResponse) => {
        const keys = resp.keys || []
        this.setState({
          keys,
          sortField: resp.sortField,
          sortDirection: resp.sortDirection,
        })
        // If we don't have keys and intro, then show create dialog
        if (keys.length == 0 && this.props.intro) {
          this.setState({openCreate: 'INTRO'})
          store.update((s) => {
            s.intro = false
          })
        }
      })
      .catch(this.snackErr)
  }

  onChange = () => {
    this.reload()
  }

  select = (key: Key) => {
    this.setState({openKey: key.id!, selected: key.id!})
  }

  isSelected = (kid?: string): boolean => {
    return !!kid && this.state.selected == kid
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
    this.setState({contextPosition: undefined, selected: ''})
  }

  export = () => {
    this.setState({contextPosition: undefined, openExport: this.state.selected})
  }

  delete = () => {
    const key = this.state.keys.find((k: Key) => {
      return this.state.selected == k.id
    })

    this.setState({contextPosition: undefined, openRemove: key})
  }

  sort = (field: string, sortField?: string, sortDirection?: SortDirection) => {
    const active = sortField === field
    let direction: SortDirection = sortDirection || SortDirection.ASC
    if (active) {
      direction = flipDirection(direction)
    } else {
      direction = SortDirection.ASC
    }
    this.list(this.state.input, field, direction)
  }

  openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({keyMenuRef: event.currentTarget})
  }

  closeMenu = () => {
    this.setState({keyMenuRef: undefined})
  }

  keyGen = () => {
    this.closeMenu()
    this.setState({openCreate: 'NEW'})
  }

  importKey = () => {
    this.closeMenu()
    this.setState({openImport: true})
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
    this.setState({selected: ''})
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
    const buttonWidth = 80
    return (
      <Box display="flex" flexDirection="column">
        <Header />

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
            style={{marginTop: 2, minWidth: buttonWidth}}
            // startIcon={<AddIcon />}
          >
            New
          </Button>
          <Box paddingLeft={1} />
          <Button
            // color="primary"
            variant="outlined"
            size="small"
            onClick={this.importKey}
            style={{marginTop: 2, minWidth: buttonWidth}}
            // startIcon={<ImportKeyIcon />}
          >
            Import
          </Button>
          <Box paddingLeft={1} />
          <Button
            // color="primary"
            variant="outlined"
            size="small"
            onClick={this.searchKey}
            style={{marginTop: 2, minWidth: buttonWidth}}
            // startIcon={<SearchIcon />}
          >
            Search
          </Button>
          <Box paddingLeft={1} />
          {this.state.syncEnabled && (
            <Button
              onClick={this.sync}
              size="small"
              variant="outlined"
              style={{marginTop: 2, minWidth: 'auto'}}
              disabled={this.state.syncing}
            >
              <SyncIcon />
            </Button>
          )}
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
            anchorEl={this.state.keyMenuRef}
            keepMounted
            open={!!this.state.keyMenuRef}
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
      </Box>
    )
  }

  render() {
    const {sortField, sortDirection} = this.state
    const direction = directionString(sortDirection)

    return (
      <Box display="flex" flexDirection="column" flex={1} id="keysView">
        {this.renderHeader()}
        <Divider />
        <Box display="flex" flexDirection="column" style={{height: 'calc(100vh - 77px)', overflowY: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField == 'user'}
                    direction={direction}
                    onClick={() => this.sort('user', sortField, sortDirection)}
                  >
                    <Typography style={{...styles.mono}}>User</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField == 'kid'}
                    direction={direction}
                    onClick={() => this.sort('kid', sortField, sortDirection)}
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
                    onClick={() => this.select(key)}
                    key={key.id}
                    style={{cursor: 'pointer'}}
                    selected={this.isSelected(key.id)}
                    component={(props: any) => {
                      return <tr onContextMenu={this.onContextMenu} {...props} id={key.id} />
                    }}
                  >
                    <TableCell component="th" scope="row" style={{minWidth: 200}}>
                      {key.user && <UserLabel kid={key.id!} user={key.user} />}
                    </TableCell>
                    <TableCell style={{verticalAlign: 'top'}}>
                      <IDView
                        id={key.id!}
                        owner={key.type == KeyType.X25519 || key.type === KeyType.EDX25519}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>

        <Menu
          keepMounted
          open={!!this.state.contextPosition}
          onClose={this.closeContext}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.contextPosition
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

        <KeyCreateDialog
          open={this.state.openCreate != ''}
          close={() => this.setState({openCreate: ''})}
          onChange={this.onChange}
        />
        <KeyImportDialog open={this.state.openImport} close={this.closeImport} />
        <KeyRemoveDialog keyRemove={this.state.openRemove} close={this.closeRemove} />
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
          open={this.state.snackOpen}
          {...this.state.snack}
          onClose={() => this.setState({snackOpen: false})}
        />
      </Box>
    )
  }
}

export default (_: {}) => {
  const intro = store.useState((s) => s.intro)

  return <KeysView intro={intro} />
}
