import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core'

import {clipboard, ipcRenderer} from 'electron'

import {AddIcon, ImportIcon, SyncIcon, SearchIcon} from '../icons'

import UserLabel from '../user/label'
import {IDLabel} from '../key/label'

import Header from '../header'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'
import KeyRemoveDialog from '../key/remove'
import KeyExportDialog from '../export'
import KeyView from '../key/view'
import SearchDialog from '../search/dialog'
import {directionString, flipDirection} from '../helper'

import {keys as listKeys, runtimeStatus, vaultUpdate} from '../rpc/keys'
import {Key, KeyType, SortDirection, KeysRequest} from '../rpc/keys.d'

import {store, loadStore} from './store'
import {openSnack, openSnackError} from '../snack'

export default (_: {}) => {
  const {
    createOpen,
    exportOpen,
    exportKey,
    importOpen,
    input,
    intro,
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

  const tableDirection = directionString(sortDirection)

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const sort = (field: string, sortField?: string, sortDirection?: SortDirection) => {
    const active = sortField === field
    let direction: SortDirection = sortDirection || SortDirection.ASC
    if (active) {
      direction = flipDirection(direction)
    } else {
      direction = SortDirection.ASC
    }
    store.update((s) => {
      s.sortField = field
      s.sortDirection = direction
    })
  }

  React.useEffect(() => {
    reload()
  }, [input, sortField, sortDirection])

  const openKey = (key: Key) => {
    store.update((s) => {
      s.keyOpen = true
      s.selected = key
    })
  }

  const closeKey = () => {
    store.update((s) => {
      s.selected = undefined
    })
  }

  const openExport = (key: Key) => {
    store.update((s) => {
      s.selected = key
      s.exportOpen = true
      s.exportKey = key
    })
  }

  const closeExport = () => {
    store.update((s) => {
      s.selected = undefined
      s.exportOpen = false
    })
  }

  const openRemove = (key: Key) => {
    store.update((s) => {
      s.selected = key
      s.removeOpen = true
      s.removeKey = key
    })
  }

  const closeRemove = (removed: boolean) => {
    store.update((s) => {
      s.removeOpen = false
      s.selected = undefined
    })
    if (removed) {
      reload()
    }
  }

  const openImport = () => {
    store.update((s) => {
      s.importOpen = true
    })
  }

  const closeImport = (imported: string) => {
    store.update((s) => {
      s.importOpen = false
      s.selected = keys.find((k: Key) => imported == k.id)
    })
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

  const reload = async () => {
    try {
      loadStore()
    } catch (err) {
      openSnackError(err)
    }
  }

  const sync = async () => {
    store.update((s) => {
      s.syncing = true
    })
    try {
      const resp = await vaultUpdate({})
      reload()
      store.update((s) => {
        s.syncing = false
      })
    } catch (err) {
      store.update((s) => {
        s.syncing = false
      })
      openSnackError(err)
    }
  }

  const onContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      const kid = event.currentTarget?.id
      if (!kid) return
      const key = keys.find((k: Key) => kid == k.id)

      store.update((s) => {
        s.selected = key
      })

      if (!key) return
      const isPrivate = key.type == KeyType.X25519 || key.type == KeyType.EDX25519

      let labels = []
      if (isPrivate) {
        labels = ['Copy', 'Export', 'Delete']
      } else {
        labels = ['Copy', 'Delete']
      }
      // TODO: Update

      ipcRenderer.on('context-menu', (e, arg: {label?: string; close?: boolean}) => {
        switch (arg.label) {
          case 'Export':
            openExport(key)
            break
          case 'Copy':
            if (key.id) {
              clipboard.writeText(key.id)
            }
            break
          case 'Delete':
            openRemove(key)
            break
        }
        if (arg.close) {
          ipcRenderer.removeAllListeners('context-menu')
        }
      })
      ipcRenderer.send('context-menu', {labels, x: event.clientX, y: event.clientY})
    },
    [keys]
  )

  const buttonWidth = 80

  return (
    <Box display="flex" flexDirection="column" flex={1} id="keysView">
      <Box display="flex" flexDirection="column">
        <Header />

        <Box display="flex" flexDirection="row" style={{paddingLeft: 8, marginTop: 26}}>
          <Box>
            <IconButton color="primary" onClick={() => setCreateOpen(true)} id="newKeyButton">
              <Tooltip title="Generate Key" placement="top">
                <AddIcon />
              </Tooltip>
            </IconButton>

            <IconButton onClick={openImport}>
              <Tooltip title="Import Key" placement="top">
                <ImportIcon />
              </Tooltip>
            </IconButton>
            <IconButton onClick={() => setSearchOpen(true)}>
              <Tooltip title="Search Keys" placement="top">
                <SearchIcon />
              </Tooltip>
            </IconButton>
            {syncEnabled && (
              <IconButton onClick={sync} disabled={syncing}>
                <Tooltip title="Sync Vault" placement="top">
                  <SyncIcon />
                </Tooltip>
              </IconButton>
            )}
          </Box>
          <Box display="flex" flexDirection="row" flexGrow={1} />
          <TextField
            placeholder="Filter"
            variant="outlined"
            value={input}
            onChange={onInputChange}
            inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
            style={{marginTop: 6, width: 300, marginRight: 10}}
          />

          <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} reload={reload} />
        </Box>
      </Box>
      <Divider />
      <Box display="flex" flexDirection="row" flex={1} style={{position: 'relative'}}>
        <Box
          display="flex"
          flexDirection="column"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
            width: 249,
          }}
        >
          <Table size="small">
            <TableBody>
              {keys.map((key, index) => {
                return (
                  <TableRow
                    hover
                    onClick={() => openKey(key)}
                    key={key.id}
                    style={{cursor: 'pointer'}}
                    selected={selected?.id == key.id}
                    component={(props: any) => {
                      return <tr onContextMenu={onContextMenu} {...props} id={key.id} />
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box display="flex" flexDirection="column">
                        {key.user && <UserLabel user={key.user} />}
                        {!key.user && <Typography>-</Typography>}
                        <IDLabel
                          k={key}
                          owner
                          style={{
                            width: 210,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider orientation="vertical" style={{position: 'absolute', top: 0, left: 249, bottom: 0}} />
        <Box
          style={{
            position: 'absolute',
            top: 16,
            left: 260,
            right: 0,
            bottom: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {selected && <KeyView k={selected} refresh={reload} />}
        </Box>
      </Box>

      <KeyCreateDialog open={createOpen} close={() => setCreateOpen(false)} onChange={reload} />
      <KeyImportDialog open={importOpen} close={closeImport} />
      {removeKey && <KeyRemoveDialog open={removeOpen} k={removeKey} close={closeRemove} />}
      {exportKey && <KeyExportDialog open={exportOpen} k={exportKey} close={closeExport} />}
    </Box>
  )
}
