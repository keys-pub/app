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
  Build as ToolsIcon,
  Settings as SettingsIcon,
  Album as WormholeIcon,
  Security as SecretsIcon,
  Usb as AuthenticatorsIcon,
  Toys as ExpermimentalIcon,
  Backup as VaultIcon,
} from '@material-ui/icons'

import {setLocation, store} from './store'

type NavRoute = {
  label: string
  location: string
  icon: React.ReactType
  id: string
  onClick?: () => void
  anchorRef?: React.MutableRefObject<HTMLDivElement | undefined>
}

const backgroundColor = '#2f2f2f'
const backgroundColorSelected = '#1a1a1a'

// TODO: Nav hover

export default (props: {}) => {
  const [openExperimental, setOpenExperimental] = React.useState(false)

  const {location, navMinimized} = store.useState((s) => ({
    location: s.location,
    navMinimized: s.navMinimized,
  }))

  const experimentRef = React.useRef<HTMLDivElement>()
  const openExperiment = (location: string) => {
    setLocation(location)
    setOpenExperimental(false)
  }

  const width = navMinimized ? 68 : 140
  const drawerStyles: CSSProperties = !navMinimized
    ? {width, border: 0, height: '100%'}
    : {
        width,
        border: 0,
        height: '100%',
        flexShrink: 0,
        overflowX: 'hidden',
      }

  let navs: NavRoute[] = [
    {
      label: 'Keys',
      icon: KeysIcon,
      location: 'keys',
      id: 'navKeysItemIcon',
    },
    {
      label: 'Secrets',
      icon: SecretsIcon,
      location: 'secrets',
      id: 'navSecretsItemIcon',
    },
    {
      label: 'Tools',
      icon: ToolsIcon,
      location: 'tools',
      id: 'navToolsItemIcon',
    },
    {
      label: 'Vault',
      icon: VaultIcon,
      location: 'vault',
      id: 'navVaultItemIcon',
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      location: 'settings',
      id: 'navSettingsItemIcon',
    },
    {
      label: 'Experiments',
      icon: ExpermimentalIcon,
      location: 'experiments',
      onClick: () => setOpenExperimental(true),
      anchorRef: experimentRef,
      id: 'navExperimentsItemIcon',
    },
  ]

  // TODO: Drawer transitions

  return (
    <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={true}>
      <Box display="flex" flexGrow={1} flexDirection="column" style={{backgroundColor}}>
        <Box height={33} style={{backgroundColor: backgroundColor}} className="drag" />
        <List style={{minWidth: width, height: '100%', padding: 0}}>
          {navs.map((nav, index) =>
            row(
              nav,
              index,
              location.startsWith(nav.location),
              !navMinimized,
              nav.onClick ? nav.onClick : () => setLocation(nav.location)
            )
          )}
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
      <Menu
        id="experimental-menu"
        anchorEl={experimentRef.current}
        keepMounted
        open={openExperimental}
        onClose={() => setOpenExperimental(false)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={() => openExperiment('wormhole')}>
          <WormholeIcon />
          <Typography style={{marginLeft: 10}}>Wormhole</Typography>
        </MenuItem>
        <MenuItem onClick={() => openExperiment('authenticators')}>
          <AuthenticatorsIcon />
          <Typography style={{marginLeft: 10}}>Authenticators</Typography>
        </MenuItem>
      </Menu>
    </Drawer>
  )
}

const row = (nav: NavRoute, index: number, selected: boolean, open: boolean, onClick?: () => void) => {
  return (
    <ListItem
      button
      ref={nav.anchorRef as React.RefObject<HTMLDivElement>}
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
