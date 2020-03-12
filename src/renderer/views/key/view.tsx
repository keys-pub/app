import * as React from 'react'

import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import KeyContentView from './content'
import UserSignDialog from '../user/dialog'
import UserRevokeDialog from '../user/revoke'
import KeyRemoveDialog from './remove'
import KeyExportDialog from '../export'

import {goBack, push} from 'connected-react-router'

import {store} from '../../store'

import {key, keyRemove, pull} from '../../rpc/rpc'
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
} from '../../rpc/types'

type Props = {
  value: Key
}

type State = {
  key: Key
  openRevoke: number
  openUserSign: string
}

export default class KeyView extends React.Component<Props, State> {
  state = {
    key: this.props.value,
    openRevoke: 0,
    openUserSign: '',
  }

  refresh = (update: boolean) => {
    const req: KeyRequest = {
      identity: this.props.value.id,
      update,
    }
    key(req, (err: RPCError, resp: KeyResponse) => {
      if (err) {
        // TODO: error
        return
      }
      if (resp.key) {
        this.setState({key: resp.key})
      } else {
        // TODO: error
      }
    })
  }

  revoke = () => {
    this.setState({openRevoke: this.state.key.user.seq})
  }

  userSign = (service: string) => {
    this.setState({openUserSign: service})
  }

  closeUserSign = () => {
    this.setState({openUserSign: ''})
  }

  render() {
    const key: Key = this.state.key
    const kid = key.id

    return (
      <Box>
        <KeyContentView value={this.state.key} revoke={this.revoke} userSign={this.userSign} />
        <UserRevokeDialog
          kid={kid}
          seq={this.state.openRevoke}
          open={this.state.openRevoke > 0}
          close={() => this.setState({openRevoke: 0})}
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
