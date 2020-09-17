import * as React from 'react'
import {CSSProperties} from 'react'

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core'

import {
  VpnKeyOutlined as KeysIcon,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  Search as SearchIcon,
  EnhancedEncryption as CryptoToolsIcon,
  Settings as SettingsIcon,
  Album as WormholeIcon,
  Security as SecretsIcon,
  Policy as AuthnIcon,
  Backup as VaultIcon,
} from '@material-ui/icons'

import {setLocation, store} from './store'

type NavRoute = {
  label: string
  location: string
  icon: React.ReactType
  id: string
}

const backgroundColor = '#2f2f2f'
const backgroundColorSelected = '#1a1a1a'

// TODO: Nav hover

export default (props: {}) => {
  const {location, navMinimized} = store.useState((s) => ({
    location: s.location,
    navMinimized: s.navMinimized,
  }))

  const width = navMinimized ? 68 : 120
  const drawerStyles: CSSProperties = !navMinimized
    ? {width, border: 0, height: '100%'}
    : {
        width,
        border: 0,
        height: '100%',
        flexShrink: 0,
        overflowX: 'hidden',
      }

  const navs: NavRoute[] = [
    {
      label: 'Keys',
      icon: KeysIcon,
      location: '/keys',
      id: 'navKeysItemIcon',
    },
    {
      label: 'Secrets',
      icon: SecretsIcon,
      location: '/secrets',
      id: 'navSecretsItemIcon',
    },
    {
      label: 'Crypto',
      icon: CryptoToolsIcon,
      location: '/tools',
      id: 'navToolsItemIcon',
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      location: '/settings',
      id: 'navSettingsItemIcon',
    },
  ]

  const experiments: NavRoute[] = [
    {
      label: 'Wormhole',
      icon: WormholeIcon,
      location: '/wormhole',
      id: 'navWormholeItemIcon',
    },
  ]

  // TODO: Drawer transitions

  return (
    <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={true}>
      <Box display="flex" flexGrow={1} flexDirection="column" style={{backgroundColor}}>
        <Box height={33} style={{backgroundColor: backgroundColor}} className="drag" />
        <List style={{minWidth: width, height: '100%', padding: 0}}>
          {navs.map((nav) => row(nav, location, !navMinimized, false, () => setLocation(nav.location)))}
          {experiments.map((nav) => row(nav, location, !navMinimized, true, () => setLocation(nav.location)))}
        </List>
        <Box display="flex" flexDirection="row">
          {/* <Typography style={{color: '#999', paddingLeft: 10, paddingBottom: 10, alignSelf: 'flex-end'}}>              
            </Typography> */}
          <Box display="flex" flexGrow={1} />
          <IconButton
            onClick={() =>
              store.update((s) => {
                s.navMinimized = !navMinimized
              })
            }
            style={{color: 'white', alignSelf: 'flex-end'}}
          >
            {navMinimized && <LeftIcon />}
            {!navMinimized && <RightIcon />}
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  )
}

const row = (nav: NavRoute, location: string, open: boolean, experiment: boolean, onClick?: () => void) => {
  const selected = location.startsWith(nav.location)
  if (experiment && !selected) return null
  return (
    <ListItem
      button
      style={{
        height: 40,
        backgroundColor: selected ? backgroundColorSelected : backgroundColor,
      }}
      onClick={onClick}
      key={nav.location}
    >
      <ListItemIcon style={{minWidth: 0, marginRight: 6}} id={nav.id}>
        <nav.icon
          style={{
            fontSize: open ? 18 : 24,
            marginLeft: open ? -1 : 4,
            color: selected ? 'white' : '#999',
          }}
        />
      </ListItemIcon>
      {open && (
        <ListItemText
          primary={nav.label}
          primaryTypographyProps={{
            style: {color: selected ? 'white' : '#dfdfdf'},
          }}
        />
      )}
    </ListItem>
  )
}
