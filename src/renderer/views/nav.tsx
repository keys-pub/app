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
  fido2: boolean
}

class Nav extends React.Component<Props, State> {
  state = {
    fido2: false,
  }

  componentDidMount() {
    this.status()
  }

  toggleDrawer = () => {
    store.dispatch({type: 'NAV_MINIMIZE', payload: {navMinimize: !this.props.navMinimize}})
  }

  status = () => {
    const req: RuntimeStatusRequest = {}
    runtimeStatus(req, (err: RPCError, resp: RuntimeStatusResponse) => {
      if (err) {
        store.dispatch({type: 'ERROR', payload: {error: err}})
        return
      }
      this.setState({fido2: resp.fido2})
    })
  }

  render() {
    const route = routesMap.get(this.props.path)
    if (!route) return null

    const open = !this.props.navMinimize
    console.log('Drawer open:', open)
    const width = open ? 140 : 68
    const drawerStyles: CSSProperties = open
      ? {width, border: 0, height: '100%'}
      : {width, border: 0, height: '100%', flexShrink: 0, overflowX: 'hidden'}

    let navs = [
      {name: 'Keys', icon: KeysIcon, route: '/keys/index', prefix: '/keys'},
      {name: 'Secrets', icon: SecretsIcon, route: '/secrets/index', prefix: '/secrets'},
      {name: 'Tools', icon: ToolsIcon, route: '/tools/index', prefix: '/tools'},
      {name: 'Wormhole', icon: WormholeIcon, route: '/wormhole/index', prefix: '/wormhole'},
    ]

    if (this.state.fido2) {
      navs.push({
        name: 'Devices',
        icon: AuthenticatorsIcon,
        route: '/authenticators/index',
        prefix: '/authenticators',
      })
    }

    navs.push({name: 'Settings', icon: SettingsIcon, route: '/settings/index', prefix: '/settings'})

    return (
      <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={open}>
        <Box display="flex" flexGrow={1} flexDirection="column" style={{backgroundColor}}>
          <Box height={38} style={{backgroundColor: backgroundColor}}></Box>
          <List style={{minWidth: width, height: '100%', padding: 0}}>
            {navs.map((nav, index) =>
              row(nav, index, route?.path.startsWith(nav.prefix), open, () => store.dispatch(push(nav.route)))
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
      </Drawer>
    )
  }
}

const backgroundColor = '#2f2f2f'
const backgroundColorSelected = '#1a1a1a'

const row = (nav: any, index: number, selected: boolean, open: boolean, onClick: any) => {
  return (
    <ListItem
      button
      style={{height: 40, backgroundColor: selected ? backgroundColorSelected : backgroundColor}}
      onClick={onClick}
      key={nav.route}
    >
      <ListItemIcon style={{minWidth: 0, marginRight: 10}}>
        <nav.icon
          style={{fontSize: open ? 20 : 24, marginLeft: open ? 0 : 4, color: selected ? 'white' : '#dfdfdf'}}
        />
      </ListItemIcon>
      {open && (
        <ListItemText
          primary={nav.name}
          primaryTypographyProps={{style: {color: selected ? 'white' : '#dfdfdf'}}}
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
