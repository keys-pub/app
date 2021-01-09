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
  Typography,
} from '@material-ui/core'

import {clipboard, ipcRenderer} from 'electron'

import {AddIcon, ImportIcon, SyncIcon, SearchIcon, UserIcon} from '../icons'

import UserLabel from '../user/label'
import {IDLabel} from '../key/label'

import Header from '../header'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'
import KeyRemoveDialog from '../key/remove'
import KeyExportDialog from '../export'
import KeyDialog from '../key'
import SearchDialog from '../search/dialog'
import {directionString, flipDirection} from '../helper'

import {rpc} from '../rpc/client'
import {EDX25519, X25519} from '../rpc/keys'
import {Key, SortDirection} from '@keys-pub/tsclient/lib/rpc'

import {store, loadStore} from './store'
import {openSnack, openSnackError} from '../snack'
import {column2Color} from '../theme'
import Tooltip from '../components/tooltip'

export default (_: {}) => {
  const {
    createOpen,
    exportOpen,
    exportKey,
    importOpen,
    input,
    keyOpen,
    keyShow,
    removeOpen,
    removeKey,
    results,
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
      s.keyShow = key
      s.selected = key
    })
  }

  const closeKey = () => {
    store.update((s) => {
      s.keyOpen = false
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
      // TODO: Highlight for a second?
      // s.selected = imported
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
      const resp = await rpc.vaultUpdate({})
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

      const key = results.find((k: Key) => kid == k.id)
      if (!key) return

      const isPrivate = key.isPrivate

      let labels = []
      if (isPrivate) {
        labels = ['Copy', 'Export', 'Delete']
      } else {
        labels = ['Copy', 'Delete']
      }
      // TODO: Update

      store.update((s) => {
        s.selected = key
      })

      ipcRenderer.removeAllListeners('context-menu')
      ipcRenderer.on('context-menu', (e, arg: {label?: string; close?: boolean}) => {
        switch (arg.label) {
          case 'Export':
            openExport(key)
            break
          case 'Copy':
            if (key.id) {
              clipboard.writeText(key.id)
              openSnack({message: 'Copied key.', duration: 4000})
            }
            break
          case 'Delete':
            openRemove(key)
            break
        }
        if (arg.close) {
          store.update((s) => {
            s.selected = undefined
          })
        }
      })
      ipcRenderer.send('context-menu', {labels, x: event.clientX, y: event.clientY})
    },
    [results]
  )

  return (
    <Box display="flex" flexDirection="column" flex={1} id="keysView">
      <Box display="flex" flexDirection="column">
        <Header />

        <Box
          display="flex"
          flexDirection="row"
          style={{paddingLeft: 8, paddingTop: 20, marginTop: 8, position: 'relative'}}
        >
          <Box style={{marginTop: 4}}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setCreateOpen(true)}
              id="newKeyButton"
              style={{marginRight: 12}}
            >
              <Tooltip title="Generate Key" placement="top">
                <AddIcon />
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={openImport} style={{marginRight: 12}}>
              <Tooltip title="Import Key" placement="top">
                <ImportIcon />
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={() => setSearchOpen(true)} style={{marginRight: 12}}>
              <Tooltip title="Search Keys" placement="top">
                <SearchIcon />
              </Tooltip>
            </IconButton>
            {syncEnabled && (
              <IconButton size="small" onClick={sync} disabled={syncing} style={{marginRight: 12}}>
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
            style={{marginBottom: 8, marginRight: 10, width: 300}}
          />

          <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} reload={reload} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
        <Divider />
        <Box style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, overflowY: 'auto'}}>
          <Table size="small">
            <TableBody>
              {results.map((key: Key, index: number) => {
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
                    <TableCell component="th" scope="row" style={{minWidth: 200}}>
                      {key.user && <UserLabel user={key.user} />}
                      {!key.user && <Typography style={{color: '#afafaf'}}>—</Typography>}
                    </TableCell>
                    <TableCell style={{verticalAlign: 'top', width: 530}}>
                      <IDLabel em k={key} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <KeyCreateDialog open={createOpen} close={() => setCreateOpen(false)} onChange={reload} />
      <KeyImportDialog open={importOpen} close={closeImport} />
      {removeKey && <KeyRemoveDialog open={removeOpen} k={removeKey} close={closeRemove} />}
      {exportKey && <KeyExportDialog open={exportOpen} k={exportKey} close={closeExport} />}
      <KeyDialog open={keyOpen} close={closeKey} kid={keyShow?.id} reload={reload} />
    </Box>
  )
}
