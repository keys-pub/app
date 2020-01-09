// @flow
import React, {Component} from 'react'

import {Avatar, Box, Button, Dialog, DialogTitle, Typography} from '@material-ui/core'

import {Add as AddIcon} from '@material-ui/icons'

import KeyView from './view'

import type {Key, Statement} from '../../rpc/types'

type Props = {
  value: Key,
  statements: Array<Statement>,
  open: boolean,
  close: () => void,
  add: () => void,
  remove: () => void,
}

export default class KeyDialog extends Component<Props> {
  render() {
    return (
      <Dialog onClose={this.props.close} open={this.props.open}>
        {
          //<DialogTitle>Key</DialogTitle>
        }
        <Box paddingTop={3} paddingLeft={1} paddingBottom={1}>
          <KeyView
            kval={this.props.value}
            statements={this.props.statements}
            add={this.props.add}
            remove={this.props.remove}
          />
        </Box>
      </Dialog>
    )
  }
}
