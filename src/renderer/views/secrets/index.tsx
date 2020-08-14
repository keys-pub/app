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

import Header from '../header'

import {Color as AlertColor} from '@material-ui/lab/Alert'

import {styles} from '../../components'
import Snack, {SnackProps} from '../../components/snack'

import SecretRemoveDialog from './remove'
import SecretEditView from './edit'
import SecretContentView from './content'

import {directionString, flipDirection} from '../helper'

import {secrets, runtimeStatus, vaultUpdate} from '../../rpc/keys'
import {
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

type Props = {
  intro?: boolean
}

type Position = {
  x: number
  y: number
}

type State = {
  contextPosition?: Position
  secrets: Secret[]
  sortField: string
  sortDirection: SortDirection
  input: string
  keyMenuElement?: HTMLButtonElement
  editing?: Secret
  isNew: boolean
  openRemove?: Secret
  selected?: Secret
  openSnack?: SnackProps
  syncEnabled: boolean
  syncing: boolean
}

export default class SecretsView extends React.Component<Props, State> {
  state: State = {
    secrets: [],
    sortField: '',
    sortDirection: SortDirection.ASC,
    input: '',
    isNew: false,
    syncEnabled: false,
    syncing: false,
  }

  componentDidMount() {
    this.reload()
  }

  reload = () => {
    const req: RuntimeStatusRequest = {}
    runtimeStatus(req)
      .then((resp: RuntimeStatusResponse) => {
        this.setState({syncEnabled: !!resp.sync})
        this.list(this.state.input, this.state.sortField, this.state.sortDirection)
      })
      .catch(this.setError)
  }

  setError = (err: Error) => {
    this.setState({openSnack: {message: err.message, alert: 'error'}})
  }

  sync = () => {
    this.setState({syncing: true})
    const req: VaultUpdateRequest = {}
    vaultUpdate(req)
      .then((res: VaultUpdateResponse) => {
        this.setState({syncing: false})
        this.reload()
      })
      .catch(this.setError)
  }

  list = (query: string, sortField: string, sortDirection: SortDirection) => {
    console.log('List secrets', query, sortField, sortDirection)
    const req: SecretsRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
    }
    secrets(req)
      .then((resp: SecretsResponse) => {
        this.setState({
          secrets: resp.secrets || [],
          sortField: resp.sortField || '',
          sortDirection: resp.sortDirection || SortDirection.ASC,
        })
        // If we don't have keys and intro, then show create dialog
        //   if (resp.secrets.length == 0 && this.props.intro) {
        //     this.setState({openCreate: 'INTRO'})
        //   }
      })
      .catch(this.setError)
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
    this.setState({contextPosition: undefined, selected: undefined})
  }

  delete = () => {
    const secret = this.state.secrets.find((s: Secret) => {
      return this.state.selected?.id == s.id
    })
    this.setState({contextPosition: undefined, openRemove: secret})
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
    this.setState({selected: undefined})
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
    this.setState({
      isNew: true,
      editing: {
        id: '',
        name: '',
        type: SecretType.PASSWORD_SECRET,
        username: '',
        password: '',
        url: '',
        notes: '',
        createdAt: 0,
        updatedAt: 0,
      },
    })
  }

  edit = () => {
    this.setState({isNew: false, editing: this.state.selected})
  }

  cancelEdit = () => {
    this.setState({isNew: false, editing: undefined})
  }

  secretChanged = (changed: Secret) => {
    this.setState({isNew: false, editing: undefined, selected: changed})
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
    const selected = this.state.secrets.find((s: Secret) => {
      return this.state.selected?.id == s.id
    })

    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Header />
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
                        onClick={() => this.select(secret)}
                        key={secret.id}
                        style={{cursor: 'pointer'}}
                        selected={this.isSelected(secret.id || '')}
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
            {!this.state.editing && selected && this.state.selected && (
              <SecretContentView secret={this.state.selected} edit={this.edit} />
            )}
          </Box>
        </Box>

        <Menu
          keepMounted
          open={this.state.contextPosition !== null}
          onClose={this.closeContext}
          anchorReference="anchorPosition"
          anchorPosition={
            !!this.state.contextPosition
              ? {top: this.state.contextPosition.y, left: this.state.contextPosition.x}
              : undefined
          }
        >
          <MenuItem color="secondary" onClick={this.delete}>
            <DeleteIcon />
            <Typography style={{marginLeft: 10, marginRight: 20}}>Delete</Typography>
          </MenuItem>
        </Menu>

        <SecretRemoveDialog secret={this.state.openRemove} close={this.closeRemove} />
        <Snack snack={this.state.openSnack} onClose={() => this.setState({openSnack: undefined})} />
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
