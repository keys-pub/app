// @flow
import React, {Component} from 'react'

import {Box, Button, Divider, IconButton, Menu, MenuItem, Typography} from '@material-ui/core'
import SettingsIcon from '@material-ui/icons/Settings'
import {Settings as GroupActionsIcon} from '@material-ui/icons'

import type {Inbox} from '../../rpc/types'

type Props = {
  inbox: ?Inbox,
  info: () => void,
  leave: () => void,
}

type State = {
  menuAnchor: any,
}

export default class MessagesHeaderView extends Component<Props, State> {
  state = {
    menuAnchor: null,
  }

  open = (event: any) => {
    this.setState({menuAnchor: event.currentTarget})
  }

  leave = () => {
    this.props.leave()
    this.setState({menuAnchor: null})
  }

  info = () => {
    this.props.info()
    this.setState({menuAnchor: null})
  }

  close = () => {
    this.setState({menuAnchor: null})
  }

  render() {
    const inbox: ?Inbox = this.props.inbox
    if (!inbox) return null

    const name = inbox.name
    return (
      <Box style={{height: 40}}>
        <Box display="flex" flex={1} flexDirection="row">
          <Box
            display="flex"
            flex={1}
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            style={{
              overflow: 'hidden',
            }}
          >
            <Typography>{name}</Typography>
          </Box>
          <Box>
            <Box display="flex" flex={1} flexDirection="row">
              <Box display="flex" flex={1}>
                <Typography> </Typography>
              </Box>
              <Box style={{marginRight: 0}}>
                <IconButton
                  aria-owns={this.state.menuAnchor ? 'add-menu' : null}
                  aria-haspopup="true"
                  onClick={this.open}
                >
                  <GroupActionsIcon />
                </IconButton>
              </Box>
            </Box>
            <Menu
              id="add-menu"
              anchorEl={this.state.menuAnchor}
              open={Boolean(this.state.menuAnchor)}
              onClose={this.close}
            >
              <MenuItem onClick={this.leave}>Leave the Group</MenuItem>
              <Divider />
              <MenuItem onClick={this.info}>Info</MenuItem>
            </Menu>
          </Box>
        </Box>
        <Divider />
      </Box>
    )
  }
}
