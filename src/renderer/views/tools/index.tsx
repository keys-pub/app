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
  Tooltip,
  Typography,
} from '@material-ui/core'

import EncryptView from '../encrypt'
import DecryptView from '../decrypt'
import SignView from '../sign'
import VerifyView from '../verify'

// import {withStyles, Theme, makeStyles} from '@material-ui/core/styles'

import {
  EnhancedEncryption as EncryptIcon,
  LockOpen as DecryptIcon,
  CreateOutlined as SignIcon,
  VisibilityOutlined as VerifyIcon,
} from '@material-ui/icons'

type Props = {}

type State = {
  selected: string // 'encrypt' | 'decrypt' | 'sign' | 'verify'
}

type Nav = {
  name: string
  id: string
  icon: any
}

const navs: Array<Nav> = [
  {name: 'Encrypt', icon: EncryptIcon, id: 'encrypt'},
  {name: 'Decrypt', icon: DecryptIcon, id: 'decrypt'},
  {name: 'Sign', icon: SignIcon, id: 'sign'},
  {name: 'Verify', icon: VerifyIcon, id: 'verify'},
]

// TODO: hover

export default class ToolsView extends React.Component<Props, State> {
  state = {
    selected: 'encrypt',
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Divider />
        <Box display="flex" flexGrow={1} flexDirection="row">
          <List
            style={{
              height: '100%',
              padding: 0,
            }}
          >
            {navs.map((nav, index) =>
              row(nav, index, this.state.selected == nav.id, () => this.setState({selected: nav.id}))
            )}
          </List>
          <Divider orientation="vertical" />
          <Box display="flex" flexDirection="column" flex={1}>
            {this.state.selected == 'encrypt' && <EncryptView />}
            {this.state.selected == 'decrypt' && <DecryptView />}
            {this.state.selected == 'sign' && <SignView />}
            {this.state.selected == 'verify' && <VerifyView />}
          </Box>
        </Box>
      </Box>
    )
  }
}

// const LightTooltip = withStyles((theme: Theme) => ({
//   tooltip: {
//     backgroundColor: theme.palette.common.white,
//     color: 'rgba(0, 0, 0, 0.87)',
//     boxShadow: theme.shadows[1],
//     fontSize: 11,
//   },
// }))(Tooltip)

const row = (nav: Nav, index: number, selected: boolean, onClick: any) => {
  return (
    <ListItem button style={{height: 42}} onClick={onClick} key={nav.id}>
      <ListItemIcon style={{minWidth: 0}}>
        <Tooltip title={nav.name} placement="left">
          <nav.icon style={{fontSize: 20, color: selected ? '#2196f3' : ''}} />
        </Tooltip>
      </ListItemIcon>

      {/* <ListItemText primary={nav.name} primaryTypographyProps={{style: {color: selected ? '#2196f3' : ''}}} /> */}
    </ListItem>
  )
}
