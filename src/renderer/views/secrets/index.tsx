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

import {ipcRenderer, clipboard} from 'electron'

import Snack, {SnackProps} from '../../components/snack'

import SecretRemoveDialog from './remove'
import SecretEditView from './edit'
import SecretContentView from './content'

import {store, loadStore} from './store'

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

import {secrets as listSecrets, runtimeStatus, vaultUpdate} from '../../rpc/keys'

type Props = {}

export default (props: Props) => {
  const {
    editing,
    input,
    isNew,
    secrets,
    selected,
    sortField,
    sortDirection,
    syncEnabled,
    syncing,
  } = store.useState()

  const [remove, setRemove] = React.useState<Secret>()
  const [removeOpen, setRemoveOpen] = React.useState(false)

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

  const onInput = React.useCallback((e) => {
    let target = e.target
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const openRemove = (secret: Secret) => {
    setRemove(secret)
    setRemoveOpen(true)
  }

  const closeRemove = (removed: boolean) => {
    setRemoveOpen(false)
    if (removed) {
      store.update((s) => {
        s.selected = undefined
      })
      reload()
    }
  }

  const openEdit = (secret?: Secret) => {
    if (!secret) return
    store.update((s) => {
      s.isNew = false
      s.selected = secret
      s.editing = secret
    })
  }

  const closeEdit = () => {
    store.update((s) => {
      s.isNew = false
      s.editing = undefined
    })
  }

  const onContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      const id = event.currentTarget.id
      const secret = secrets.find((s: Secret) => s.id == id)
      if (!secret) return
      store.update((s) => {
        s.selected = secret
      })

      ipcRenderer.on('context-menu', (e, arg: {label?: string; close?: boolean}) => {
        switch (arg.label) {
          case 'Copy Password':
            if (secret.password) {
              clipboard.writeText(secret.password)
              openSnack({message: 'Copied to Clipboard', duration: 2000})
            }
            break
          case 'Edit':
            openEdit(secret)
            break
          case 'Delete':
            openRemove(secret)
            break
        }
        if (arg.close) {
          ipcRenderer.removeAllListeners('context-menu')
        }
      })
      ipcRenderer.send('context-menu', {
        labels: ['Copy Password', '-', 'Edit', '-', 'Delete'],
        x: event.clientX,
        y: event.clientY,
      })
    },
    [secrets]
  )

  const newSecret = () => {
    const editing: Secret = {
      id: '',
      name: '',
      type: SecretType.PASSWORD_SECRET,
      username: '',
      password: '',
      url: '',
      notes: '',
      createdAt: 0,
      updatedAt: 0,
    }
    store.update((s) => {
      s.selected = undefined
      s.editing = editing
      s.isNew = true
    })
  }

  const snackError = (err: Error) => {
    console.error(err)
    openSnack({message: err.message, alert: 'error'})
  }

  React.useEffect(() => {
    reload()
  }, [input, sortField, sortDirection])

  const reload = async () => {
    try {
      loadStore()
    } catch (err) {
      snackError(err)
    }
  }

  const sync = async () => {
    store.update((s) => {
      s.syncing = true
    })
    try {
      const req: VaultUpdateRequest = {}
      const resp = await vaultUpdate(req)
      store.update((s) => {
        s.syncing = false
      })
      reload()
    } catch (err) {
      store.update((s) => {
        s.syncing = false
      })
      snackError(err)
    }
  }

  // If filtering, selected might not be visible, but we don't want to clear
  // selected when filtering so we find from the visible list (secrets).
  const selectedInList = secrets.find((s: Secret) => {
    return selected?.id == s.id
  })

  const secretChanged = (changed: Secret) => {
    const secretsUpdated = secrets.map((secret: Secret) => {
      if (secret.id == changed.id) return changed
      return secret
    })
    store.update((s) => {
      s.isNew = false
      s.editing = undefined
      s.selected = changed
      s.secrets = secretsUpdated
    })
    // If changed is a new item we need to reload
    reload()
  }

  const setSelected = (secret: Secret) => {
    store.update((s) => {
      s.selected = secret
    })
  }

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
          <Box style={{height: 'calc(100vh - 77px)', overflowY: 'auto'}}>
            <Box display="flex" flexDirection="row" style={{height: '100%'}}>
              <Table size="small">
                {/* <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2">Name</Typography>
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
            </Box>
          </Box>
        </Box>

        <Box display="flex" flex={1}>
          {editing && (
            <SecretEditView isNew={isNew} secret={editing} onChange={secretChanged} cancel={closeEdit} />
          )}
          {!editing && <SecretContentView secret={selectedInList} edit={() => openEdit(selectedInList)} />}
        </Box>
      </Box>

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
        <Typography style={{...nowrapStyle, whiteSpace: 'nowrap'}}>{props.secret.name}</Typography>
        <Typography style={{...nowrapStyle, whiteSpace: 'nowrap', color: '#999'}}>
          {props.secret.username || '•'}
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
        <Typography style={{...nowrapStyle, whiteSpace: 'nowrap'}}>{props.secret.name}</Typography>
        <Typography style={{...nowrapStyle, whiteSpace: 'nowrap', color: '#999'}}>•</Typography>
      </Box>
    </Box>
  )
}
