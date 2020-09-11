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

import Header from '../header'

import EncryptView from '../encrypt'
import DecryptView from '../decrypt'
import SignView from '../sign'
import VerifyView from '../verify'

import {Store} from 'pullstate'

import {
  EnhancedEncryption as EncryptIcon,
  LockOpen as DecryptIcon,
  CreateOutlined as SignIcon,
  VisibilityOutlined as VerifyIcon,
} from '@material-ui/icons'

type Props = {}

type Nav = {
  label: string
  name: string
  icon: any
}

const navs: Array<Nav> = [
  {label: 'Encrypt', icon: EncryptIcon, name: 'encrypt'},
  {label: 'Decrypt', icon: DecryptIcon, name: 'decrypt'},
  {label: 'Sign', icon: SignIcon, name: 'sign'},
  {label: 'Verify', icon: VerifyIcon, name: 'verify'},
]

type State = {
  selected: string
}

const store = new Store<State>({
  selected: 'encrypt',
})

export default (props: Props) => {
  const {selected} = store.useState()

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
            row(nav, index, selected == nav.name, () => {
              store.update((s) => {
                s.selected = nav.name
              })
            })
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
    <ListItem button style={{height: 42}} onClick={onClick} key={nav.name}>
      <Tooltip title={nav.name} placement="left">
        <ListItemIcon style={{minWidth: 0}}>
          <nav.icon style={{fontSize: 20, color: selected ? '#2196f3' : ''}} />
        </ListItemIcon>
      </Tooltip>
      {/* <ListItemText primary={nav.name} primaryTypographyProps={{style: {color: selected ? '#2196f3' : ''}}} /> */}
    </ListItem>
  )
}
