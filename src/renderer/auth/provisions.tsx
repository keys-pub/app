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
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@material-ui/core'

import {AddIcon} from '../icons'
import {column2Color} from '../theme'

import {keys} from '../rpc/client'
import {AuthProvision, AuthType} from '@keys-pub/tsclient/lib/keys'
import {Store} from 'pullstate'
import {dateString} from '../helper'
import ProvisionPassword from './provision/password'
import ProvisionPaperKey from './provision/paper-key'
import ProvisionFIDO2 from './provision/fido2'
import {ipcRenderer} from 'electron'
import DeprovisionDialog from './provision/deprovision'
import {authTypeDescription} from './helper'
import {breakWords, contentTop} from '../theme'
import {openSnack, openSnackError} from '../snack'
import {store as appStore, loadStatus} from '../store'

type Props = {}

type State = {
  provisions: AuthProvision[]
  selected?: AuthProvision
}

const initialState: State = {
  provisions: [],
}

export const store = new Store(initialState)

const refresh = async (selected?: AuthProvision) => {
  try {
    const resp = await keys.authProvisions({})
    const provisions = resp.provisions || []
    let selectedProvision = provisions.find((p: AuthProvision) => p.id == selected?.id)

    if (!selectedProvision && provisions.length > 0) selectedProvision = provisions[0]
    store.update((s) => {
      s.provisions = provisions
      s.selected = selectedProvision
    })
  } catch (err) {
    openSnackError(err)
  }
}

export default (props: Props) => {
  const {provisions, selected} = store.useState()
  const fido2Enabled = appStore.useState((s) => s.fido2Enabled)

  React.useEffect(() => {
    loadStatus()
    refresh(selected)
  }, [])

  const select = (provision: AuthProvision) => {
    store.update((s) => {
      s.selected = provision
    })
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [passwordOpen, setPasswordOpen] = React.useState(false)
  const [paperKeyOpen, setPaperKeyOpen] = React.useState(false)
  const [fido2Open, setFIDO2Open] = React.useState(false)
  const [deprovision, setDeprovision] = React.useState<AuthProvision>()
  const [deprovisionOpen, setDeprovisionOpen] = React.useState(false)

  const onAddOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const onAddClose = () => {
    setAnchorEl(null)
  }

  const openRemove = (provision: AuthProvision) => {
    if (provisions.length == 1) {
      openSnackError(new Error('Only one provision left, add another before removing'))
      return
    }
    setDeprovision(provision)
    setDeprovisionOpen(true)
  }

  const closeRemove = (removed: boolean) => {
    setDeprovisionOpen(false)
    if (removed) {
      store.update((s) => {
        s.selected = undefined
      })
      refresh()
    }
  }

  const onContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      const id = event.currentTarget.id
      const provision = provisions.find((s: AuthProvision) => s.id == id)
      if (!provision) return
      store.update((s) => {
        s.selected = provision
      })

      ipcRenderer.on('context-menu', (e, arg: {label?: string; close?: boolean}) => {
        switch (arg.label) {
          case 'Deprovision':
            openRemove(provision)
            break
        }
        if (arg.close) {
          ipcRenderer.removeAllListeners('context-menu')
        }
      })
      ipcRenderer.send('context-menu', {
        labels: ['Deprovision'],
        x: event.clientX,
        y: event.clientY,
      })
    },
    [provisions]
  )

  const col1 = 204

  return (
    <Box display="flex" flexDirection="column" flex={1}>
      <Box display="flex" flexDirection="row" flex={1} style={{height: '100%', position: 'relative'}}>
        <Box display="flex" flexDirection="column" style={{width: 204, background: column2Color}}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            style={{
              paddingLeft: 8,
              paddingTop: contentTop,
            }}
          >
            <Typography variant="h6" style={{marginRight: 10, paddingLeft: 8, width: '100%'}}>
              Provisions
            </Typography>
            <IconButton color="primary" size="small" onClick={onAddOpen}>
              <AddIcon />
            </IconButton>
          </Box>
          <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
            <Box
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: col1,
                overflowX: 'hidden',
                overflowY: 'auto',
              }}
            >
              <Table size="small">
                <TableBody>
                  {provisions.map((provision, index) => {
                    return (
                      <TableRow
                        hover
                        onClick={() => select(provision)}
                        key={provision.id}
                        style={{cursor: 'pointer'}}
                        selected={provision.id == selected?.id}
                        component={(props: any) => {
                          return <tr onContextMenu={onContextMenu} {...props} id={provision.id} />
                        }}
                      >
                        <TableCell>
                          <Typography noWrap>{authTypeDescription(provision.type, true)}</Typography>
                          <Typography noWrap style={{color: '#777777'}}>
                            {dateString(provision.createdAt) || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          flex={1}
          style={{
            position: 'absolute',
            left: col1,
            top: 28,
            bottom: 0,
            right: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          {selected && (
            <Table size="small">
              <TableBody>
                <TableRow style={{borderBottom: 0}}>
                  <TableCell style={{width: 70}}>
                    <Typography align="right">ID</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{...breakWords}}>
                      {selected.id}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow style={{borderBottom: 0}}>
                  <TableCell>
                    <Typography align="right">Type</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{authTypeDescription(selected.type, true)}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow style={{borderBottom: 0}}>
                  <TableCell>
                    <Typography align="right">Created</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{dateString(selected.createdAt) || 'Unknown'}</Typography>
                  </TableCell>
                </TableRow>
                {selected.aaguid && (
                  <TableRow>
                    <TableCell>
                      <Typography align="right">AAGUID</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{selected.aaguid}</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={onAddClose}>
        <MenuItem
          onClick={() => {
            setPasswordOpen(true)
            onAddClose()
          }}
        >
          Password
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPaperKeyOpen(true)
            onAddClose()
          }}
        >
          Paper Key
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!fido2Enabled) {
              openSnackError(new Error('FIDO2 is not available'))
              onAddClose()
              return
            }
            setFIDO2Open(true)
            onAddClose()
          }}
        >
          FIDO2 Key
        </MenuItem>
      </Menu>
      {passwordOpen && (
        <ProvisionPassword
          open={passwordOpen}
          close={(snack?: string) => {
            setPasswordOpen(false)
            if (snack) openSnack({message: snack, duration: 4000})
            refresh()
          }}
        />
      )}
      {paperKeyOpen && (
        <ProvisionPaperKey
          open={paperKeyOpen}
          close={(snack?: string) => {
            setPaperKeyOpen(false)
            if (snack) openSnack({message: snack, duration: 4000})
            refresh()
          }}
        />
      )}
      {fido2Open && (
        <ProvisionFIDO2
          open={fido2Open}
          close={(snack?: string) => {
            setFIDO2Open(false)
            if (snack) openSnack({message: snack, duration: 4000})
            refresh()
          }}
        />
      )}
      <DeprovisionDialog open={deprovisionOpen} provision={deprovision} close={closeRemove} />
    </Box>
  )
}
