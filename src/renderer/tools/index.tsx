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

import {withStyles, Theme, createStyles, makeStyles} from '@material-ui/core/styles'

import {store, setLocation} from '../store'
import {column1Color} from '../theme'

import {EncryptIcon, DecryptIcon, SignIcon, VerifyIcon} from '../icons'

type Props = {}

type Nav = {
  label: string
  name: string
  icon: any
  location: string
}

const navs: Array<Nav> = [
  {label: 'Encrypt', icon: EncryptIcon, name: '/encrypt', location: '/tools/encrypt'},
  {label: 'Decrypt', icon: DecryptIcon, name: '/decrypt', location: '/tools/decrypt'},
  {label: 'Sign', icon: SignIcon, name: '/sign', location: '/tools/sign'},
  {label: 'Verify', icon: VerifyIcon, name: '/verify', location: '/tools/verify'},
]

let lastSelected = ''

export default (props: Props) => {
  const location = store.useState((s) => s.location)
  let selected = location.replace(/^(\/tools)/, '')
  if (selected == '') {
    if (!lastSelected) lastSelected = '/encrypt'
    selected = lastSelected
  } else {
    lastSelected = selected
  }

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <Header />
      <Box display="flex" flexGrow={1} flexDirection="row" style={{height: '100%'}}>
        <List
          style={{
            padding: 0,
            paddingTop: 26,
            backgroundColor: column1Color,
          }}
        >
          {navs.map((nav, index) =>
            row(nav, index, selected == nav.name, () => {
              setLocation(nav.location)
            })
          )}
        </List>
        <Box display="flex" flexDirection="column" flex={1}>
          {selected == '/encrypt' && <EncryptView />}
          {selected == '/decrypt' && <DecryptView />}
          {selected == '/sign' && <SignView />}
          {selected == '/verify' && <VerifyView />}
        </Box>
      </Box>
    </Box>
  )
}

// const LightTooltip = withStyles((theme: Theme) => ({
//   tooltip: {
//     backgroundColor: theme.palette.common.white,
//     color: 'rgba(0, 0, 0, 0.87)',
//     boxShadow: theme.shadows[4],
//   },
// }))(Tooltip)

const row = (nav: Nav, index: number, selected: boolean, onClick: any) => {
  return (
    <ListItem button style={{height: 40}} onClick={onClick} key={nav.name}>
      {/* <LightTooltip title={nav.label} placement="left"> */}
      <ListItemIcon style={{minWidth: 0}}>
        <nav.icon style={{fontSize: 20, color: selected ? '#2196f3' : ''}} />
      </ListItemIcon>
      {/* </LightTooltip> */}
      {/* <ListItemText primary={nav.name} primaryTypographyProps={{style: {color: selected ? '#2196f3' : ''}}} /> */}
    </ListItem>
  )
}
