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
  VpnLock as PasswordIcon,
  EventNote as NoteIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
} from '@material-ui/icons'

import {Color as AlertColor} from '@material-ui/lab/Alert'

import {styles, Snack} from '../../components'

import {store} from '../../store'

import {connect} from 'react-redux'

import SecretRemoveDialog from './remove'
import SecretEditView from './edit'
import SecretContentView from './content'

import {directionString, flipDirection} from '../helper'

import {secrets, runtimeStatus, vaultUpdate} from '../../rpc/keys'
import {
  RPCError,
  Secret,
  SortDirection,
  SecretType,
  SecretsRequest,
  SecretsResponse,
  RuntimeStatusRequest,
  RuntimeStatusResponse,
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
  secrets: Array<Secret>
  sortField: string
  sortDirection: SortDirection
  input: string
  newKeyMenuEl: HTMLButtonElement
  editing: Secret
  isNew: boolean
  openRemove: OpenRemove
  selected: Secret
  openSnack: string
  openSnackAlert: string
  syncEnabled: boolean
  syncing: boolean
}

type OpenRemove = {
  open: boolean
  secret: Secret
}

class SecretsView extends React.Component<Props, State> {
  state = {
    contextPosition: null,
    secrets: [],
    sortField: '',
    sortDirection: 'ASC' as SortDirection,
    input: '',
    newKeyMenuEl: null,
    editing: null,
    isNew: false,
    openRemove: {open: false, secret: null},
    selected: null,
    openSnack: '',
    openSnackAlert: '',
    syncEnabled: false,
    syncing: false,
  }

  componentDidMount() {
    this.reload()
  }

  reload = () => {
    const req: RuntimeStatusRequest = {}
    runtimeStatus(req, (err: RPCError, resp: RuntimeStatusResponse) => {
      if (err) {
        return
      }
      this.setState({syncEnabled: resp.sync})
      this.list(this.state.input, this.state.sortField, this.state.sortDirection)
    })
  }

  sync = () => {
    this.setState({syncing: true})
    const req: VaultUpdateRequest = {}
    vaultUpdate(req, (err: RPCError, resp: VaultUpdateResponse) => {
      this.setState({syncing: false})
      if (err) {
        this.setState({openSnack: err.details, openSnackAlert: 'error'})
      }
      this.reload()
    })
  }

  list = (query: string, sortField: string, sortDirection: SortDirection) => {
    console.log('List secrets', query, sortField, sortDirection)
    const req: SecretsRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
    }
    secrets(req, (err: RPCError, resp: SecretsResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({
        secrets: resp.secrets,
        sortField: resp.sortField,
        sortDirection: resp.sortDirection,
      })
      // If we don't have keys and intro, then show create dialog
      //   if (resp.secrets.length == 0 && this.props.intro) {
      //     this.setState({openCreate: 'INTRO'})
      //   }
    })
  }

  onChange = () => {
    this.reload()
  }

  select = (secret: Secret) => {
    this.setState({selected: secret})
  }

  isSelected = (id: string) => {
    return this.state.selected?.id == id
  }

  onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const id = event.currentTarget.id
    const secret = this.state.secrets.find((s: Secret) => s.id == id)
    this.setState({
      contextPosition: {x: event.clientX - 2, y: event.clientY - 4},
      selected: secret,
    })
  }

  closeContext = () => {
    this.setState({contextPosition: null, selected: null})
  }

  delete = () => {
    const secret: Secret = this.state.secrets.find((s: Secret) => {
      return this.state.selected?.id == s.id
    })

    this.setState({contextPosition: null, openRemove: {open: true, secret}})
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

  closeRemove = (removed: boolean) => {
    this.setState({openRemove: {open: false, secret: this.state.openRemove.secret}, selected: null})
    this.reload()
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      input: target.value,
    })
    this.list(target.value, this.state.sortField, this.state.sortDirection)
  }

  newSecret = () => {
    this.setState({isNew: true, editing: {type: SecretType.PASSWORD_SECRET}})
  }

  edit = () => {
    this.setState({isNew: false, editing: this.state.selected})
  }

  cancelEdit = () => {
    this.setState({isNew: false, editing: null})
  }

  secretChanged = (changed: Secret) => {
    this.setState({isNew: false, editing: null, selected: changed})
    this.reload()
  }

  renderHeader() {
    return (
      <Box
        display="flex"
        flexDirection="row"
        flex={1}
        style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 8, height: 34}}
      >
        <TextField
          placeholder="Filter"
          variant="outlined"
          value={this.state.input}
          onChange={this.onInputChange}
          inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
          style={{marginTop: 2, width: '100%', marginRight: 10}}
        />
        <Button
          color="primary"
          variant="outlined"
          size="small"
          onClick={this.newSecret}
          disabled={!!this.state.editing}
          style={{marginTop: 2, minWidth: 'auto', marginRight: 8}}
        >
          <AddIcon />
        </Button>
        {this.state.syncEnabled && (
          <Button
            onClick={this.sync}
            size="small"
            variant="outlined"
            style={{marginTop: 2, minWidth: 'auto', marginRight: 8}}
            disabled={this.state.syncing}
          >
            <SyncIcon />
          </Button>
        )}
      </Box>
    )
  }

  render() {
    const {sortField, sortDirection} = this.state
    const direction = directionString(sortDirection)

    // If filtering, selected might not be visible, but we don't want to clear
    // selected when filtering so we check to see if it's in the list before
    // showing.
    const selected: Secret = this.state.secrets.find((s: Secret) => {
      return this.state.selected?.id == s.id
    })

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
          <MenuItem color="secondary" onClick={this.delete}>
            <DeleteIcon />
            <Typography style={{marginLeft: 10, marginRight: 20}}>Delete</Typography>
          </MenuItem>
        </Menu>
        <Box display="flex" flexDirection="row" flex={1} style={{height: '100%'}}>
          <Box style={{width: 250}}>
            {this.renderHeader()}
            <Divider />
            <Box style={{height: 'calc(100vh - 84px)', overflowY: 'auto'}}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography style={{...styles.mono}}>Name</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.secrets.map((secret, index) => {
                    return (
                      <TableRow
                        hover
                        onClick={(event) => this.select(secret)}
                        key={secret.id}
                        style={{cursor: 'pointer'}}
                        selected={this.isSelected(secret.id)}
                        component={(props: any) => {
                          return <tr onContextMenu={this.onContextMenu} {...props} id={secret.id} />
                        }}
                      >
                        <TableCell component="th" scope="row" style={{padding: 0}}>
                          <Cell secret={secret} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
          <Divider orientation="vertical" />
          <Box display="flex" flex={1}>
            {this.state.editing && (
              <SecretEditView
                isNew={this.state.isNew}
                secret={this.state.editing}
                onChange={this.secretChanged}
                cancel={this.cancelEdit}
              />
            )}
            {!this.state.editing && selected && (
              <SecretContentView secret={this.state.selected} edit={this.edit} />
            )}
          </Box>
        </Box>
        <SecretRemoveDialog
          open={this.state.openRemove.open}
          secret={this.state.openRemove.secret}
          close={this.closeRemove}
        />
        <Snack
          open={!!this.state.openSnack}
          message={this.state.openSnack}
          alert={this.state.openSnackAlert as AlertColor}
          onClose={() => this.setState({openSnack: ''})}
          duration={4000}
        />
      </Box>
    )
  }
}

const nowrapStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  width: 195,
}

const Cell = (props: {secret: Secret}) => {
  return (
    <Box display="flex" flexDirection="row" style={{paddingTop: 6, paddingBottom: 6, paddingLeft: 8}}>
      {props.secret.type == SecretType.PASSWORD_SECRET && <PasswordCell {...props} />}
      {props.secret.type == SecretType.NOTE_SECRET && <NoteCell {...props} />}
    </Box>
  )
}

const PasswordCell = (props: {secret: Secret}) => {
  return (
    <Box display="flex" flexDirection="row">
      <PasswordIcon style={{alignSelf: 'center', paddingRight: 8}} />
      <Box display="flex" flexDirection="column">
        <Typography style={{...nowrapStyle, whiteSpace: 'nowrap', fontSize: '1.1em', paddingBottom: 2}}>
          {props.secret.name}
        </Typography>
        <Typography style={{...nowrapStyle, ...styles.mono, whiteSpace: 'nowrap', color: '#777777'}}>
          {props.secret.username || '-'}
        </Typography>
      </Box>
    </Box>
  )
}

const NoteCell = (props: {secret: Secret}) => {
  return (
    <Box display="flex" flexDirection="row">
      <NoteIcon style={{alignSelf: 'center', paddingRight: 8}} />
      <Box display="flex" flexDirection="column">
        <Typography style={{...nowrapStyle, whiteSpace: 'nowrap', fontSize: '1.1em', paddingBottom: 2}}>
          {props.secret.name}
        </Typography>
        <Typography style={{...nowrapStyle, ...styles.mono, whiteSpace: 'nowrap', color: '#777777'}}>
          (note)
        </Typography>
      </Box>
    </Box>
  )
}

const mapStateToProps = (state: {app: AppState}, ownProps: any) => {
  return {
    intro: state.app.intro,
  }
}

export default connect(mapStateToProps)(SecretsView)
