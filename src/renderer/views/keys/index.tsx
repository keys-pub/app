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

import {styles} from '../../components'
import Snack, {SnackProps} from '../../components/snack'
import UserLabel from '../user/label'
import {IDView} from '../key/content'

import {Store} from 'pullstate'

import Header from '../header'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'
import KeyRemoveDialog from '../key/remove'
import KeyExportDialog from '../export'
import KeyDialog from '../key'
import SearchDialog from '../search/dialog'
import {directionString, flipDirection} from '../helper'

import {keys as listKeys, runtimeStatus, vaultUpdate} from '../../rpc/keys'
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

type Position = {
  x: number
  y: number
}

type State = {
  contextPosition?: Position
  createOpen: boolean
  exportOpen: boolean
  exportKey: string
  importOpen: boolean
  intro: boolean
  keyOpen: boolean
  keys: Key[]
  removeOpen?: boolean
  removeKey?: Key
  searchOpen: boolean
  selected: string
  sortField?: string
  sortDirection?: SortDirection
  syncEnabled: boolean
  syncing: boolean
}

const initialState: State = {
  createOpen: false,
  exportOpen: false,
  exportKey: '',
  importOpen: false,
  intro: false,
  keyOpen: false,
  keys: [],
  searchOpen: false,
  selected: '',
  syncEnabled: false,
  syncing: false,
}

const store = new Store(initialState)

export default (_: {}) => {
  const {
    contextPosition,
    createOpen,
    exportOpen,
    exportKey,
    importOpen,
    intro,
    keyOpen,
    keys,
    removeOpen,
    removeKey,
    searchOpen,
    selected,
    sortField,
    sortDirection,
    syncEnabled,
    syncing,
  } = store.useState()

  const [input, setInput] = React.useState('')
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()

  const tableDirection = directionString(sortDirection)

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setInput(target.value || '')
  }, [])

  const setSnackErr = (err: Error) => {
    setSnackOpen(true)
    setSnack({message: err.message, alert: 'error', duration: 4000})
  }

  const select = (key: Key) => {
    store.update((s) => {
      s.keyOpen = true
      s.selected = key.id!
    })
  }

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const kid = event.currentTarget.id
    store.update((s) => {
      s.contextPosition = {x: event.clientX - 2, y: event.clientY - 4}
      s.selected = kid
    })
  }

  const closeContext = () => {
    store.update((s) => {
      s.contextPosition = undefined
      s.selected = ''
    })
  }

  const list = async (query: string, sortField?: string, sortDirection?: SortDirection) => {
    console.log('List keys', query, sortField, sortDirection)
    const req: KeysRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
      types: [],
    }
    try {
      const resp = await listKeys(req)
      const keys = resp.keys || []
      store.update((s) => {
        s.keys = keys
        s.sortField = resp.sortField
        s.sortDirection = resp.sortDirection
      })
      // If we don't have keys and intro, then show create dialog
      if (keys.length == 0 && intro) {
        store.update((s) => {
          s.createOpen = true
          s.intro = false
        })
      }
    } catch (err) {
      setSnackErr(err)
    }
  }

  const sort = (field: string, sortField?: string, sortDirection?: SortDirection) => {
    const active = sortField === field
    let direction: SortDirection = sortDirection || SortDirection.ASC
    if (active) {
      direction = flipDirection(direction)
    } else {
      direction = SortDirection.ASC
    }
    list(input, field, direction)
  }

  React.useEffect(() => {
    list(input, sortField, sortDirection)
  }, [input, sortField, sortDirection])

  const openExport = () => {
    store.update((s) => {
      s.contextPosition = undefined
      s.exportOpen = true
      s.exportKey = selected
    })
  }

  const openRemove = () => {
    const key = keys.find((k: Key) => {
      return selected == k.id
    })
    if (key) {
      store.update((s) => {
        s.contextPosition = undefined
        s.removeOpen = true
        s.removeKey = key
      })
    }
  }

  const closeImport = (imported: string) => {
    store.update((s) => {
      s.importOpen = false
      s.selected = imported
    })
    console.log('imported:', imported)
    if (imported) {
      reload()
    }
  }

  const setSearchOpen = (b: boolean) => {
    store.update((s) => {
      s.searchOpen = b
    })
  }

  const setCreateOpen = (b: boolean) => {
    store.update((s) => {
      s.createOpen = b
    })
  }

  const setImportOpen = (b: boolean) => {
    store.update((s) => {
      s.importOpen = b
    })
  }

  const setExportOpen = (b: boolean) => {
    store.update((s) => {
      s.exportOpen = b
    })
  }

  const closeKey = () => {
    store.update((s) => {
      s.selected = ''
      s.keyOpen = false
    })
  }

  const closeRemove = (removed: boolean) => {
    if (removed) {
      store.update((s) => {
        s.selected = ''
        s.removeOpen = false
      })
      reload()
    } else {
      store.update((s) => {
        s.removeOpen = false
      })
    }
  }

  const reload = async () => {
    try {
      const status = await runtimeStatus({})
      store.update((s) => {
        s.syncEnabled = !!status.sync
      })
      list(input, sortField, sortDirection)
    } catch (err) {
      setSnackErr(err)
    }
  }

  const sync = () => {
    store.update((s) => {
      s.syncing = true
    })
    const req: VaultUpdateRequest = {}
    vaultUpdate(req)
      .then((resp: VaultUpdateResponse) => {
        reload()
        store.update((s) => {
          s.syncing = false
        })
      })
      .catch((err: Error) => {
        store.update((s) => {
          s.syncing = false
        })
        setSnackErr(err)
      })
  }

  const buttonWidth = 80

  return (
    <Box display="flex" flexDirection="column" flex={1} id="keysView">
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
            onClick={() => setCreateOpen(true)}
            style={{marginTop: 2, minWidth: buttonWidth}}
            // startIcon={<AddIcon />}
            id="newKeyButton"
          >
            New
          </Button>
          <Box paddingLeft={1} />
          <Button
            // color="primary"
            variant="outlined"
            size="small"
            onClick={() => setImportOpen(true)}
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
            onClick={() => setSearchOpen(true)}
            style={{marginTop: 2, minWidth: buttonWidth}}
            // startIcon={<SearchIcon />}
          >
            Search
          </Button>
          <Box paddingLeft={1} />
          {syncEnabled && (
            <Button
              onClick={sync}
              size="small"
              variant="outlined"
              style={{marginTop: 2, minWidth: 'auto'}}
              disabled={syncing}
            >
              <SyncIcon />
            </Button>
          )}
          <Box display="flex" flexDirection="row" flexGrow={1} />
          <TextField
            placeholder="Filter"
            variant="outlined"
            value={input}
            onChange={onInputChange}
            inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
            style={{marginTop: 2, width: 300, marginRight: 10}}
          />
          <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} reload={reload} />
        </Box>
        <Divider />
      </Box>
      <Box display="flex" flexDirection="column" style={{height: 'calc(100vh - 77px)', overflowY: 'auto'}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField == 'user'}
                  direction={tableDirection}
                  onClick={() => sort('user', sortField, sortDirection)}
                >
                  <Typography style={{...styles.mono}}>User</Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell style={{width: 530}}>
                <TableSortLabel
                  active={sortField == 'kid'}
                  direction={tableDirection}
                  onClick={() => sort('kid', sortField, sortDirection)}
                >
                  <Typography style={{...styles.mono}}>Key</Typography>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((key, index) => {
              return (
                <TableRow
                  hover
                  onClick={() => select(key)}
                  key={key.id}
                  style={{cursor: 'pointer'}}
                  selected={selected == key.id}
                  component={(props: any) => {
                    return <tr onContextMenu={onContextMenu} {...props} id={key.id} />
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
        open={!!contextPosition}
        onClose={closeContext}
        anchorReference="anchorPosition"
        anchorPosition={contextPosition ? {top: contextPosition.y, left: contextPosition.x} : undefined}
      >
        <MenuItem onClick={openExport}>
          <ExportIcon />
          <Typography style={{marginLeft: 10, marginRight: 20}}>Export</Typography>
        </MenuItem>
        <MenuItem color="secondary" onClick={openRemove}>
          <DeleteIcon />
          <Typography style={{marginLeft: 10, marginRight: 20}}>Delete</Typography>
        </MenuItem>
      </Menu>

      <KeyCreateDialog open={createOpen} close={() => setCreateOpen(false)} onChange={reload} />
      <KeyImportDialog open={importOpen} close={closeImport} />
      {removeKey && <KeyRemoveDialog open={removeOpen} k={removeKey} close={closeRemove} />}
      <KeyExportDialog open={exportOpen} kid={exportKey} close={() => setExportOpen(false)} />
      <KeyDialog open={keyOpen} close={closeKey} kid={selected} reload={reload} />
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}
