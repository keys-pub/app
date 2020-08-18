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

import {useLocation} from 'wouter'
import {Store} from '../store'

type NavRoute = {
  name: string
  icon: React.ReactNode
  route: string
  prefix: string
  onClick?: () => void
  anchorRef?: React.MutableRefObject<HTMLDivElement | undefined>
}

const backgroundColor = '#2f2f2f'
const backgroundColorSelected = '#1a1a1a'

// TODO: Nav hover

export default (props: {}) => {
  const [location, setLocation] = useLocation()
  const [openExperimental, setOpenExperimental] = React.useState(false)
  const [minimized, setMinimized] = React.useState(false)

  const experimentRef = React.useRef<HTMLDivElement>()
  const openExperiment = (route: string) => {
    setLocation(route)
    setOpenExperimental(false)
  }

  const width = minimized ? 68 : 140
  const drawerStyles: CSSProperties = !minimized
    ? {width, border: 0, height: '100%'}
    : {
        width,
        border: 0,
        height: '100%',
        flexShrink: 0,
        overflowX: 'hidden',
      }

  let navs: NavRoute[] = [
    {name: 'Keys', icon: KeysIcon, route: '/keys/index', prefix: '/keys'},
    {
      name: 'Secrets',
      icon: SecretsIcon,
      route: '/secrets/index',
      prefix: '/secrets',
    },
    {
      name: 'Tools',
      icon: ToolsIcon,
      route: '/tools/index',
      prefix: '/tools',
    },
    {
      name: 'Vault',
      icon: VaultIcon,
      route: '/vault/index',
      prefix: '/vault',
    },
    {
      name: 'Settings',
      icon: SettingsIcon,
      route: '/settings/index',
      prefix: '/settings',
    },
    {
      name: 'Experiments',
      icon: ExpermimentalIcon,
      route: '/experiments/index',
      prefix: '/experiments',
      onClick: () => setOpenExperimental(true),
      anchorRef: experimentRef,
    },
  ]

  // TODO: Drawer transitions

  return (
    <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={true}>
      <Box display="flex" flexGrow={1} flexDirection="column" style={{backgroundColor}}>
        <Box height={33} style={{backgroundColor: backgroundColor}} />
        <List style={{minWidth: width, height: '100%', padding: 0}}>
          {navs.map((nav, index) =>
            row(
              nav,
              index,
              location.startsWith(nav.prefix),
              !minimized,
              nav.onClick ? nav.onClick : () => setLocation(nav.route),
              nav.anchorRef
            )
          )}
        </List>
        <Box display="flex" flexDirection="row">
          {/* <Typography style={{color: '#999', paddingLeft: 10, paddingBottom: 10, alignSelf: 'flex-end'}}>              
            </Typography> */}
          <Box display="flex" flexGrow={1} />
          <IconButton
            onClick={() => setMinimized(!minimized)}
            style={{color: 'white', alignSelf: 'flex-end'}}
          >
            {minimized && <LeftIcon />}
            {!minimized && <RightIcon />}
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
        <MenuItem onClick={() => openExperiment('/wormhole/index')}>
          <WormholeIcon />
          <Typography style={{marginLeft: 10}}>Wormhole</Typography>
        </MenuItem>
        <MenuItem onClick={() => openExperiment('/authenticators/index')}>
          <AuthenticatorsIcon />
          <Typography style={{marginLeft: 10}}>Authenticators</Typography>
        </MenuItem>
      </Menu>
    </Drawer>
  )
}

const row = (
  nav: any,
  index: number,
  selected: boolean,
  open: boolean,
  onClick?: () => void,
  anchorRef?: React.MutableRefObject<HTMLDivElement | undefined>
) => {
  return (
    <ListItem
      button
      ref={anchorRef as React.RefObject<HTMLDivElement>}
      style={{
        height: 40,
        backgroundColor: selected ? backgroundColorSelected : backgroundColor,
      }}
      onClick={onClick}
      key={nav.name}
    >
      <ListItemIcon style={{minWidth: 0, marginRight: 6}}>
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
          primary={nav.name}
          primaryTypographyProps={{
            style: {fontSize: 14, color: selected ? 'white' : '#dfdfdf'},
          }}
        />
      )}
    </ListItem>
  )
}
