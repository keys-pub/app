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

import {secrets as listSecrets, runtimeStatus, vaultUpdate} from '../../rpc/keys'
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

type Props = {}

type Position = {
  x: number
  y: number
}

export default (props: Props) => {
  const [sortField, setSortField] = React.useState<string>()
  const [sortDirection, setSortDirection] = React.useState<SortDirection>()
  const [secrets, setSecrets] = React.useState<Secret[]>([])
  const [selected, setSelected] = React.useState<Secret>()
  const [input, setInput] = React.useState('')
  const [editing, setEditing] = React.useState<Secret>()
  const [isNew, setIsNew] = React.useState(false)
  const [syncEnabled, setSyncEnabled] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [contextPosition, setContextPosition] = React.useState<Position>()

  const [remove, setRemove] = React.useState<Secret>()
  const [removeOpen, setRemoveOpen] = React.useState(false)
  const openRemove = (secret: Secret) => {
    setRemove(secret)
    setRemoveOpen(true)
  }

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

  const onInput = React.useCallback((e) => {
    let target = e.target
    setInput(target.value || '')
  }, [])

  const onContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      const id = event.currentTarget.id
      const secret = secrets.find((s: Secret) => s.id == id)
      setContextPosition({x: event.clientX - 2, y: event.clientY - 4})
      setSelected(secret)
    },
    [secrets]
  )

  // const direction = directionString(sortDirection)

  const newSecret = () => {
    setEditing({
      id: '',
      name: '',
      type: SecretType.PASSWORD_SECRET,
      username: '',
      password: '',
      url: '',
      notes: '',
      createdAt: 0,
      updatedAt: 0,
    })
    setIsNew(true)
  }

  const snackError = (err: Error) => {
    openSnack({message: err.message, alert: 'error'})
  }

  React.useEffect(() => {
    reload()
  }, [])

  const reload = () => {
    const req: RuntimeStatusRequest = {}
    runtimeStatus(req)
      .then((resp: RuntimeStatusResponse) => {
        setSyncEnabled(!!resp.sync)
        list(input, sortField, sortDirection)
      })
      .catch(snackError)
  }

  const sync = () => {
    setSyncing(true)
    const req: VaultUpdateRequest = {}
    vaultUpdate(req)
      .then((res: VaultUpdateResponse) => {
        setSyncing(false)
        reload()
      })
      .catch(snackError)
  }

  const list = (query: string, sortField?: string, sortDirection?: SortDirection) => {
    console.log('List secrets', query, sortField, sortDirection)
    const req: SecretsRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
    }
    listSecrets(req)
      .then((resp: SecretsResponse) => {
        setSecrets(resp.secrets || [])
        setSortField(sortField)
        setSortDirection(resp.sortDirection)
      })
      .catch(snackError)
  }

  // If filtering, selected might not be visible, but we don't want to clear
  // selected when filtering so we find from the visible list (secrets).
  const selectedInList = secrets.find((s: Secret) => {
    return selected?.id == s.id
  })

  const cancelEdit = () => {
    setIsNew(false)
    setEditing(undefined)
  }

  const secretChanged = (changed: Secret) => {
    setIsNew(false)
    setEditing(undefined)
    setSelected(changed)
    reload()
  }

  const closeContext = () => {
    setContextPosition(undefined)
    setSelected(undefined)
  }

  const removeSecret = () => {
    setContextPosition(undefined)
    if (selected) {
      openRemove(selected)
    }
  }

  const closeRemove = (removed: boolean) => {
    setRemoveOpen(false)
    if (removed) {
      setSelected(undefined)
      reload()
    }
  }

  const edit = () => {
    setIsNew(false)
    setEditing(selected)
  }

  // const sort = (sortField: string, field: string, sortDirection: SortDirection) => {
  //   const active = sortField === field
  //   let direction: SortDirection = sortDirection
  //   if (active) {
  //     direction = flipDirection(sortDirection)
  //   } else {
  //     direction = SortDirection.ASC
  //   }
  //   list(input, field, direction)
  // }

  return (
    <Box display="flex" flexDirection="column" flex={1}>
      <Header />
      <Box display="flex" flexDirection="row" flex={1} style={{height: '100%'}}>
        <Box style={{width: 250}}>
          <Box
            display="flex"
            flexDirection="row"
            flex={1}
            style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 8, height: 34}}
          >
            <TextField
              placeholder="Filter"
              variant="outlined"
              value={input}
              onChange={onInput}
              inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
              style={{marginTop: 2, width: '100%', marginRight: 10}}
            />
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={newSecret}
              disabled={!!editing}
              style={{marginTop: 2, minWidth: 'auto', marginRight: 8}}
            >
              <AddIcon />
            </Button>
            {syncEnabled && (
              <Button
                onClick={sync}
                size="small"
                variant="outlined"
                style={{marginTop: 2, minWidth: 'auto', marginRight: 8}}
                disabled={syncing}
              >
                <SyncIcon />
              </Button>
            )}
          </Box>
          <Divider />
          <Box style={{height: 'calc(100vh - 84px)', overflowY: 'auto'}}>
            <Box display="flex" flexDirection="row" style={{height: '100%'}}>
              <Table size="small">
                {/* <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography style={{...styles.mono}}>Name</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead> */}
                <TableBody>
                  {secrets.map((secret, index) => {
                    return (
                      <TableRow
                        hover
                        onClick={() => setSelected(secret)}
                        key={secret.id}
                        style={{cursor: 'pointer'}}
                        selected={selected?.id == secret.id}
                        component={(props: any) => {
                          return <tr onContextMenu={onContextMenu} {...props} id={secret.id} />
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
              <Divider orientation="vertical" />
            </Box>
          </Box>
        </Box>

        <Box display="flex" flex={1}>
          {editing && (
            <SecretEditView isNew={isNew} secret={editing} onChange={secretChanged} cancel={cancelEdit} />
          )}
          {!editing && <SecretContentView secret={selectedInList} edit={edit} />}
        </Box>
      </Box>

      <Menu
        keepMounted
        open={!!contextPosition}
        onClose={closeContext}
        anchorReference="anchorPosition"
        anchorPosition={contextPosition ? {top: contextPosition.y, left: contextPosition.x} : undefined}
      >
        <MenuItem color="secondary" onClick={removeSecret}>
          <DeleteIcon />
          <Typography style={{marginLeft: 10, marginRight: 20}}>Delete</Typography>
        </MenuItem>
      </Menu>

      <SecretRemoveDialog open={removeOpen} secret={remove} close={closeRemove} />
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
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
