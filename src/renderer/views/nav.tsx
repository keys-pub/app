import * as React from 'react'

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

import {makeStyles, useTheme} from '@material-ui/core/styles'

import {AppState} from '../reducers/app'
import {store} from '../store'

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

import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {routesMap} from './routes'
import {CSSProperties} from '@material-ui/styles'

import {runtimeStatus} from '../rpc/keys'
import {RPCError, RuntimeStatusRequest, RuntimeStatusResponse} from '../rpc/keys.d'

type Props = {
  path: string
  navMinimize: boolean
}

// TODO: Nav hover

type State = {
  openExperimental: boolean
}

class Nav extends React.Component<Props, State> {
  state = {
    openExperimental: false,
  }
  private experimentRef = React.createRef<HTMLButtonElement>()

  // componentDidMount() {
  //   this.status()
  // }

  toggleDrawer = () => {
    store.dispatch({
      type: 'NAV_MINIMIZE',
      payload: {navMinimize: !this.props.navMinimize},
    })
  }

  // status = () => {
  //   const req: RuntimeStatusRequest = {}
  //   runtimeStatus(req, (err: RPCError, resp: RuntimeStatusResponse) => {
  //     if (err) {
  //       store.dispatch({type: 'ERROR', payload: {error: err}})
  //       return
  //     }
  //     this.setState({fido2: resp.fido2})
  //   })
  // }

  openExperimental = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({openExperimental: true})
  }

  closeExperimental = () => {
    this.setState({openExperimental: false})
  }

  wormhole = () => {
    store.dispatch(push('/wormhole/index'))
    this.closeExperimental()
  }

  authenticators = () => {
    store.dispatch(push('/authenticators/index'))
    this.closeExperimental()
  }

  render() {
    const route = routesMap.get(this.props.path)
    if (!route) return null

    const open = !this.props.navMinimize
    console.log('Drawer open:', open)
    const width = open ? 140 : 68
    const drawerStyles: CSSProperties = open
      ? {width, border: 0, height: '100%'}
      : {
          width,
          border: 0,
          height: '100%',
          flexShrink: 0,
          overflowX: 'hidden',
        }

    let navs = [
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
        onClick: this.openExperimental,
        anchorRef: this.experimentRef,
      },
    ]

    return (
      <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={open}>
        <Box display="flex" flexGrow={1} flexDirection="column" style={{backgroundColor}}>
          <Box height={38} style={{backgroundColor: backgroundColor}}></Box>
          <List style={{minWidth: width, height: '100%', padding: 0}}>
            {navs.map((nav, index) =>
              row(
                nav,
                index,
                route?.path.startsWith(nav.prefix),
                open,
                nav.onClick ? nav.onClick : () => store.dispatch(push(nav.route)),
                nav.anchorRef
              )
            )}
          </List>
          <Box display="flex" flexDirection="row">
            {/* <Typography style={{color: '#999', paddingLeft: 10, paddingBottom: 10, alignSelf: 'flex-end'}}>              
            </Typography> */}
            <Box display="flex" flexGrow={1} />
            <IconButton onClick={this.toggleDrawer} style={{color: 'white', alignSelf: 'flex-end'}}>
              {open && <LeftIcon />}
              {!open && <RightIcon />}
            </IconButton>
          </Box>
        </Box>
        <Menu
          id="experimental-menu"
          anchorEl={this.experimentRef.current}
          keepMounted
          open={this.state.openExperimental}
          onClose={this.closeExperimental}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          getContentAnchorEl={null}
        >
          <MenuItem onClick={this.wormhole}>
            <WormholeIcon />
            <Typography style={{marginLeft: 10}}>Wormhole</Typography>
          </MenuItem>
          <MenuItem onClick={this.authenticators}>
            <AuthenticatorsIcon />
            <Typography style={{marginLeft: 10}}>Authenticators</Typography>
          </MenuItem>
        </Menu>
      </Drawer>
    )
  }
}

const backgroundColor = '#2f2f2f'
const backgroundColorSelected = '#1a1a1a'

const row = (nav: any, index: number, selected: boolean, open: boolean, onClick: any, anchorRef: any) => {
  return (
    <ListItem
      button
      ref={anchorRef}
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
            color: selected ? 'white' : '#dfdfdf',
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

const mapStateToProps = (state: {app: AppState; router: any}, ownProps: any) => {
  return {
    path: state.router.location.pathname,
    navMinimize: state.app.navMinimize,
  }
}

export default connect(mapStateToProps)(Nav)
