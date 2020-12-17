import * as React from 'react'

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
} from '@material-ui/core'

import Header from '../header'

import GeneralView from './general'
import VaultView from '../vault'
import AuthenticatorsView from '../authenticators'
import DebugView from './debug'
import StyleGuide from '../style-guide'
import DBView from '../db'
import AuthProvisionsView from '../auth/provisions'

import {column1Color} from '../theme'
import {store, setLocation} from '../store'

type Props = {}

type Nav = {
  label: string
  name: string
  location: string
}

const navs: Array<Nav> = [
  {label: 'General', name: '/general', location: '/settings/general'},
  {label: 'Vault', name: '/vault', location: '/settings/vault'},
  {label: 'Auth', name: '/auth', location: '/settings/auth'},
  {label: 'FIDO2', name: '/fido2', location: '/settings/fido2'},
  {label: 'Debug', name: '/debug', location: '/settings/debug'},
]

let lastSelected = ''

export default (props: Props) => {
  const location = store.useState((s) => s.location)
  let selected = location.replace(/^(\/settings)/, '')
  if (selected == '') {
    if (!lastSelected) lastSelected = '/general'
    selected = lastSelected
  } else {
    lastSelected = selected
  }

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <Header />
      <Box display="flex" flexGrow={1} flexDirection="row" style={{height: '100%'}}>
        <List
          style={{
            padding: 0,
            backgroundColor: column1Color,
            paddingTop: 26,
          }}
        >
          {navs.map((nav, index) =>
            row(nav, index, selected.startsWith(nav.name), () => {
              setLocation(nav.location)
            })
          )}
        </List>
        <Box display="flex" flexDirection="column" flex={1}>
          {selected == '/general' && <GeneralView />}
          {selected == '/vault' && <VaultView />}
          {selected == '/auth' && <AuthProvisionsView />}
          {selected == '/fido2' && <AuthenticatorsView />}
          {selected == '/debug' && <DebugView />}
          {selected == '/debug/db/service' && <DBView db="service" />}
          {selected == '/debug/db/vault' && <DBView db="vault" />}
          {selected == '/debug/style-guide' && <StyleGuide />}
        </Box>
      </Box>
    </Box>
  )
}

const row = (nav: Nav, index: number, selected: boolean, onClick: any) => {
  return (
    <ListItem button style={{height: 40}} onClick={onClick} key={nav.name}>
      <ListItemText
        primary={nav.label}
        primaryTypographyProps={{style: {color: selected ? '#2196f3' : ''}}}
      />
    </ListItem>
  )
}
