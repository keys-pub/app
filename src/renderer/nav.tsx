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
  KeysIcon,
  LeftArrowIcon,
  RightArrowIcon,
  CryptoToolsIcon,
  SettingsIcon,
  WormholeIcon,
  SecretsIcon,
  ScreenLockIcon,
} from './icons'
import Tooltip from './components/tooltip'

import {setLocation, store} from './store'
import {keys, auth} from './rpc/client'

type NavRoute = {
  label: string
  location: string
  icon: React.ReactType
  id: string
}

const backgroundColor = '#2f2f2f'
const backgroundColorSelected = '#1a1a1a'

// TODO: Nav hover

const lock = async () => {
  auth.token = ''
  store.update((s) => {
    s.unlocked = false
  })
  await keys.AuthLock({})
}

export default (props: {}) => {
  const {location, navMinimized} = store.useState((s) => ({
    location: s.location,
    navMinimized: s.navMinimized,
  }))

  const width = navMinimized ? 68 : 106
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
        <Box height={30} style={{backgroundColor: backgroundColor}} className="drag" />
        <List style={{minWidth: width, height: '100%', padding: 0}}>
          {navs.map((nav) => row(nav, location, !navMinimized, false, () => setLocation(nav.location)))}
          {experiments.map((nav) => row(nav, location, !navMinimized, true, () => setLocation(nav.location)))}
        </List>
        <Box display="flex" flexDirection="row">
          {/* <Typography style={{color: '#999', paddingLeft: 10, paddingBottom: 10, alignSelf: 'flex-end'}}>              
            </Typography> */}
          <IconButton size="small" onClick={lock} id="lockButton">
            <Tooltip title="Lock App" dark>
              <ScreenLockIcon fontSize="small" style={{marginLeft: 10, color: '#999'}} />
            </Tooltip>
          </IconButton>
          <Box display="flex" flexGrow={1} />
          <IconButton
            onClick={() =>
              store.update((s) => {
                s.navMinimized = !navMinimized
              })
            }
            style={{color: '#999', alignSelf: 'flex-end'}}
          >
            {navMinimized && <RightArrowIcon />}
            {!navMinimized && <LeftArrowIcon />}
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  )
}

const row = (nav: NavRoute, location: string, open: boolean, experiment: boolean, onClick?: () => void) => {
  // Check with or without path ('/') prefix for backwards compatibility
  const selected = location.startsWith(nav.location) || ('/' + location).startsWith(nav.location)
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
            fontSize: open ? 'inherit' : 24,
            marginLeft: open ? -1 : 4,
            color: selected ? 'white' : '#dfdfdf',
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
