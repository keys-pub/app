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
  error: string
  key: Key
  loading: boolean
  openExport: boolean
  openRemove: boolean
  openRevoke: number
  openUserSign: string
}

export default class KeyView extends React.Component<Props, State> {
  state = {
    error: '',
    key: this.props.value,
    loading: false,
    openExport: false,
    openRemove: false,
    openRevoke: 0,
    openUserSign: '',
  }

  closeRemove = (removed: boolean) => {
    this.setState({openRemove: false})
    if (removed) {
      store.dispatch(goBack())
    }
  }

  closeExport = () => {
    this.setState({openExport: false})
  }

  closeUserSign = () => {
    this.setState({openUserSign: ''})
  }

  refresh = () => {
    this.setState({error: ''})
    const req: KeyRequest = {
      identity: this.state.key.id,
    }
    key(req, (err: RPCError, resp: KeyResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (resp.key) {
        this.setState({key: resp.key, loading: false})
      } else {
        this.setState({error: 'Key not found', loading: false})
      }
    })
  }

  add = () => {
    this.setState({loading: true, error: ''})
    const req: PullRequest = {
      identity: this.state.key.id,
    }
    pull(req, (err: RPCError, resp: PullResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.refresh()
    })
  }

  removePublic = () => {
    const req: KeyRemoveRequest = {
      kid: this.state.key.id,
    }
    keyRemove(req, (err: RPCError, resp: KeyRemoveResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      store.dispatch(goBack())
    })
  }

  export = () => {
    this.setState({openExport: true})
  }

  remove = () => {
    this.setState({openRemove: true})
  }

  revoke = () => {
    this.setState({openRevoke: this.state.key.user.seq})
  }

  userSign = (service: string) => {
    this.setState({openUserSign: service})
  }

  render() {
    const key: Key = this.state.key
    const kid = key.id

    return (
      <Box>
        <KeyContentView
          value={this.state.key}
          add={this.add}
          export={this.export}
          remove={this.remove}
          removePublic={this.removePublic}
          revoke={this.revoke}
          userSign={this.userSign}
        />
        <UserRevokeDialog
          kid={kid}
          seq={this.state.openRevoke}
          open={this.state.openRevoke > 0}
          close={() => this.setState({openRevoke: 0})}
        />
        <KeyRemoveDialog open={this.state.openRemove} kid={kid} close={this.closeRemove} />
        <KeyExportDialog open={this.state.openExport} kid={kid} close={this.closeExport} />
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
