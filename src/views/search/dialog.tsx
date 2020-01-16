import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core'

import {Add as AddIcon} from '@material-ui/icons'

type Props = {
  open: boolean
  close: () => void
  add: () => void
}

export default class SearchDialog extends React.Component<Props> {
  render() {
    return (
      <Dialog onClose={this.props.close} open={this.props.open}>
        <DialogTitle>Key</DialogTitle>
        <List>
          <ListItem autoFocus button onClick={this.props.add}>
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Add" />
          </ListItem>
        </List>
      </Dialog>
    )
  }
}
