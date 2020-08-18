import * as React from 'react'
import {Store} from '../../store'

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

import Header from '../header'

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

type Nav = {
  name: string
  id: string
  icon: any
}

// TODO: hover

export default (props: Props) => {
  const navs: Array<Nav> = [
    {name: 'Encrypt', icon: EncryptIcon, id: 'encrypt'},
    {name: 'Decrypt', icon: DecryptIcon, id: 'decrypt'},
    {name: 'Sign', icon: SignIcon, id: 'sign'},
    {name: 'Verify', icon: VerifyIcon, id: 'verify'},
  ]

  const selected = Store.useState((s) => s.selectedTool)

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <Header />
      <Divider />
      <Box display="flex" flexGrow={1} flexDirection="row" style={{height: '100%'}}>
        <List
          style={{
            height: '100%',
            padding: 0,
          }}
        >
          {navs.map((nav, index) =>
            row(nav, index, selected == nav.id, () =>
              Store.update((s) => {
                s.selectedTool = nav.id
              })
            )
          )}
        </List>
        <Divider orientation="vertical" />
        <Box display="flex" flexDirection="column" flex={1}>
          {selected == 'encrypt' && <EncryptView />}
          {selected == 'decrypt' && <DecryptView />}
          {selected == 'sign' && <SignView />}
          {selected == 'verify' && <VerifyView />}
        </Box>
      </Box>
    </Box>
  )
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
      <Tooltip title={nav.name} placement="left">
        <ListItemIcon style={{minWidth: 0}}>
          <nav.icon style={{fontSize: 20, color: selected ? '#2196f3' : ''}} />
        </ListItemIcon>
      </Tooltip>
      {/* <ListItemText primary={nav.name} primaryTypographyProps={{style: {color: selected ? '#2196f3' : ''}}} /> */}
    </ListItem>
  )
}
