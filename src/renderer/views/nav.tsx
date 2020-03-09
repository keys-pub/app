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
  Person as ProfileIcon,
  VpnKeyOutlined as KeysIcon,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  Search as SearchIcon,
  EnhancedEncryption as EncryptIcon,
  LockOpen as DecryptIcon,
  CreateOutlined as SignIcon,
  VisibilityOutlined as VerifyIcon,
  Settings as SettingsIcon,
} from '@material-ui/icons'

import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {routesMap} from './routes'
import {CSSProperties} from '@material-ui/styles'

type Props = {
  path: string
  navMinimize: boolean
}

const navs = [
  {name: 'Keys', icon: KeysIcon, route: '/keys/index', prefix: '/keys'},
  {name: 'Search', icon: SearchIcon, route: '/search/index', prefix: '/search'},
  {name: 'Encrypt', icon: EncryptIcon, route: '/encrypt/index', prefix: '/encrypt'},
  {name: 'Decrypt', icon: DecryptIcon, route: '/decrypt/index', prefix: '/decrypt'},
  {name: 'Sign', icon: SignIcon, route: '/sign/index', prefix: '/sign'},
  {name: 'Verify', icon: VerifyIcon, route: '/verify/index', prefix: '/verify'},
  {name: 'Settings', icon: SettingsIcon, route: '/settings/index', prefix: '/settings'},
]

class Nav extends React.Component<Props> {
  toggleDrawer = () => {
    store.dispatch({type: 'NAV_MINIMIZE', payload: {navMinimize: !this.props.navMinimize}})
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

    return (
      <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={open}>
        <Box display="flex" flexGrow={1} flexDirection="column" style={{backgroundColor}}>
          <Box height={38} style={{backgroundColor: backgroundColor}}></Box>
          <List style={{minWidth: width, height: '100%', padding: 0}}>
            {navs.map((nav, index) =>
              row(nav, index, (route && route.path.startsWith(nav.prefix)) || false, open, () =>
                store.dispatch(push(nav.route))
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
