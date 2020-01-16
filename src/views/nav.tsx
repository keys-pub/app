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

import {
  Person as ProfileIcon,
  VpnKey as KeysIcon,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  Search as SearchIcon,
  EnhancedEncryption as EncryptIcon,
} from '@material-ui/icons'

import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {routesMap} from './routes'
import {CSSProperties} from '@material-ui/styles'

type Props = {
  path: string
  dispatch: (action: any) => any
}

type State = {
  open: boolean
}

class Nav extends React.Component<Props, State> {
  state = {
    open: true,
  }

  toggleDrawer = () => {
    this.setState({open: !this.state.open})
  }

  render() {
    const route = routesMap.get(this.props.path)
    if (!route || route.hideNav) return null

    const open = this.state.open
    console.log('Drawer open:', open)
    const width = open ? 140 : 68
    const drawerStyles: CSSProperties = open
      ? {width, border: 0}
      : {width, border: 0, flexShrink: 0, overflowX: 'hidden'}

    const navs = [
      {name: 'Keys', icon: KeysIcon, route: '/keys/index', prefix: '/keys'},
      {name: 'Search', icon: SearchIcon, route: '/search/index', prefix: '/search'},
      {name: 'Encrypt', icon: EncryptIcon, route: '/encrypt/index', prefix: '/encrypt'},
    ]

    return (
      <Drawer variant="permanent" style={drawerStyles} PaperProps={{style: drawerStyles}} open={open}>
        <Box display="flex" flexGrow={1} flexDirection="column">
          <Box height={42} style={{backgroundColor: backgroundColor}}></Box>
          <List style={{backgroundColor: backgroundColor, minWidth: width, height: '100%', padding: 0}}>
            {navs.map((nav, index) =>
              row(nav, index, (route && route.path.startsWith(nav.prefix)) || false, open, () =>
                this.props.dispatch(push(nav.route))
              )
            )}
          </List>
          <Box display="flex" justifyContent="flex-end" style={{backgroundColor: backgroundColor}}>
            <IconButton onClick={this.toggleDrawer} style={{color: 'white'}}>
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
        <nav.icon style={{fontSize: open ? 20 : 30, color: selected ? 'white' : '#dfdfdf'}} />
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

const mapStateToProps = (state: {router: any}, ownProps: any) => {
  return {
    path: state.router.location.pathname,
  }
}

export default connect(mapStateToProps)(Nav)
