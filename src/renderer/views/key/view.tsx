import * as React from 'react'

import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import KeyContentView from './content'
import UserSignDialog from '../user/dialog'
import UserRevokeDialog from '../user/revoke'
import KeyRemoveDialog from './remove'
import KeyExportDialog from '../export'

import {goBack, push} from 'connected-react-router'

import {store} from '../../store'

import {key, keyRemove, pull} from '../../rpc/keys'
import {
  RPCError,
  Key,
  KeyRequest,
  KeyResponse,
  KeyRemoveRequest,
  KeyRemoveResponse,
  PullRequest,
  PullResponse,
  KeyType,
} from '../../rpc/keys.d'

type Props = {
  value: Key
  refresh: (update: boolean) => void
}

type State = {
  openRevoke: number
  openUserSign: string
}

export default class KeyView extends React.Component<Props, State> {
  state = {
    openRevoke: 0,
    openUserSign: '',
  }

  revoke = () => {
    this.setState({openRevoke: this.props.value.user.seq})
  }

  closeRevoke = () => {
    this.setState({openRevoke: 0})
    console.log('Closing revoke')
    this.props.refresh(true)
  }

  userSign = (service: string) => {
    this.setState({openUserSign: service})
  }

  closeUserSign = (added: boolean) => {
    this.setState({openUserSign: ''})
    console.log('Closing user sign, added:', added)
    this.props.refresh(added)
  }

  render() {
    const key: Key = this.props.value
    const kid = key.id

    return (
      <Box>
        <KeyContentView value={key} revoke={this.revoke} userSign={this.userSign} />
        <UserRevokeDialog
          kid={kid}
          seq={this.state.openRevoke}
          open={this.state.openRevoke > 0}
          close={this.closeRevoke}
        />
        <UserSignDialog
          kid={kid}
          service={this.state.openUserSign}
          open={this.state.openUserSign != ''}
          close={this.closeUserSign}
        />
      </Box>
    )
  }
}
