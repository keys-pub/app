import * as React from 'react'

import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import KeyContentView from './content'
import UserSignDialog from '../user/sign'
import UserRevokeDialog from '../user/revoke'

import {Key} from '@keys-pub/tsclient/lib/rpc'

type Props = {
  k: Key
  refresh: (update: boolean) => void
}

type State = {
  openRevoke: number
  openUserSign: string
}

export default class KeyView extends React.Component<Props, State> {
  state: State = {
    openRevoke: 0,
    openUserSign: '',
  }

  revoke = () => {
    this.setState({openRevoke: this.props.k?.user?.seq || 0})
  }

  closeRevoke = (revoked: boolean) => {
    this.setState({openRevoke: 0})
    if (revoked) {
      this.props.refresh(true)
    }
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
    const key: Key = this.props.k
    const kid = key.id!

    return (
      <Box>
        <KeyContentView
          k={key}
          revoke={this.revoke}
          userSign={this.userSign}
          update={() => this.props.refresh(true)}
        />
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
