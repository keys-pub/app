// @flow
import React, {Component} from 'react'

import {
  Box,
  Button,
  Dialog,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import {connect} from 'react-redux'
import {shell} from 'electron'

import {push, goBack} from 'connected-react-router'
import {currentStatus, keyEmpty} from '../state'

import {routes} from '../routes'

import {keyTypeString, keyTypeSymbol, dateString} from '../helper'

import {styles, Link} from '../components'
import {NameView} from './user/views'
import UserIntroDialog from './user/intro'
import UserRevokeDialog from './user/revoke'

import {authLock, status, userService} from '../../rpc/rpc'
import type {AppState, RPCState} from '../../reducers/app'

import type {RouteInfo} from '../routes'
import type {
  User,
  StatusRequest,
  StatusResponse,
  UserServiceRequest,
  UserServiceResponse,
  AuthLockRequest,
} from '../../rpc/types'

type Props = {
  status: StatusResponse,
  dispatch: (action: any) => any,
}

type State = {
  revoke?: number,
}

class ProfileView extends Component<Props, State> {
  state = {}

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    const req: StatusRequest = {}
    this.props.dispatch(status(req))
  }

  lock = () => {
    const req: AuthLockRequest = {}
    this.props.dispatch(
      authLock(req, () => {
        // This triggers permission error, showing lock screen
        this.refresh()
      })
    )
  }

  select = (service: string) => {
    if (service === '') {
      this.props.dispatch({type: 'PROMPT_USER', payload: true})
      return
    }

    // this.setState({loading: true, error: ''})
    const req: UserServiceRequest = {
      kid: '', // Default
      service: service,
    }
    this.props.dispatch(
      userService(req, (resp: UserServiceResponse) => {
        // this.setState({loading: false})
        this.props.dispatch(push('/profile/user/name'))
      })
    )
  }

  render() {
    const {status} = this.props
    const key = status.key || keyEmpty()
    const kid = key.id || ''
    const users = key.users || []
    const {uri} = status

    return (
      <Box>
        <Divider style={{marginBottom: 8}} />
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell style={{...cstyles.cell, ...cstyles.key}}>
                <Typography align="right">Public Key</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <Typography style={{...styles.mono, paddingRight: 10, wordWrap: 'break-word'}}>
                    {kid}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">User</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                {(users || []).map((user: User) => (
                  <Box display="flex" flexDirection="column" key={user.kid + user.seq}>
                    <NameView user={user} />
                    {user.err && <Typography style={{color: 'red'}}>{user.err}</Typography>}
                    <Link onClick={() => shell.openExternal(user.url)}>{user.url}</Link>
                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => this.setState({revoke: user.seq})}
                      >
                        Revoke
                      </Button>
                    </Box>
                  </Box>
                ))}
                {users.length === 0 && <Link onClick={() => this.select('github')}>Link to Github</Link>}
                {users.length === 0 && <Link onClick={() => this.select('twitter')}>Link to Twitter</Link>}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">Server</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Link onClick={() => shell.openExternal(uri)}>{uri}</Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}></TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="row">
                  <Button size="small" variant="outlined" onClick={this.lock}>
                    Lock the App
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    style={{marginLeft: 10}}
                    onClick={() => this.props.dispatch(push('/debug'))}
                  >
                    Debug
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <UserRevokeDialog
          open={this.state.revoke || 0 > 0}
          revoke={this.state.revoke}
          close={() => this.setState({revoke: 0})}
        />
      </Box>
    )
  }
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
  key: {},
}

const mapStateToProps = (state: {app: AppState, rpc: RPCState}, ownProps: any): any => {
  const status = currentStatus(state.rpc)
  return {
    status,
  }
}

// $FlowFixMe
export default connect(mapStateToProps)(ProfileView)
