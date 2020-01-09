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
import {keyEmpty} from '../state'

import {routes} from '../routes'
import {selectedKID} from '../state'

import {keyTypeString, keyTypeSymbol, dateString} from '../helper'

import {styles, Link} from '../components'
import {NameView} from '../user/views'
import UserIntroDialog from '../user/intro'
import UserRevokeDialog from '../user/revoke'

import {authLock, key, statementRevoke, userService} from '../../rpc/rpc'
import type {AppState, RPCState} from '../../reducers/app'

import type {RouteInfo} from '../routes'
import type {
  KeyRequest,
  KeyResponse,
  StatementRevokeRequest,
  StatementRevokeResponse,
  UserServiceRequest,
  UserServiceResponse,
  AuthLockRequest,
  RPCError,
} from '../../rpc/rpc'

import type {Key, User} from '../../rpc/types'

type Props = {
  kid: string,
  dispatch: (action: any) => any,
}

type State = {
  key: ?Key,
  revoke: number,
  loading: boolean,
  error: string,
}

class ProfileView extends Component<Props, State> {
  state = {
    key: null,
    revoke: 0,
    loading: false,
    error: '',
  }

  componentDidMount() {
    this.loadKey()
  }

  lock = () => {
    const req: AuthLockRequest = {}
    this.props.dispatch(
      authLock(req, () => {
        // After lock, this triggers permission error, showing lock screen.
        this.loadKey()
      })
    )
  }

  loadKey = () => {
    const req: KeyRequest = {
      kid: this.props.kid,
      user: '',
      skipCheck: false,
      update: false,
    }
    this.props.dispatch(
      key(
        req,
        (resp: KeyResponse) => {
          if (resp.key) {
            this.setState({key: resp.key, loading: false})
          } else {
            this.setState({error: 'Key not found', loading: false})
          }
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  selectService = (service: string) => {
    if (service === '') {
      this.props.dispatch({type: 'PROMPT_USER', payload: true})
      return
    }

    // this.setState({loading: true, error: ''})
    const req: UserServiceRequest = {
      kid: this.props.kid,
      service: service,
    }
    this.props.dispatch(
      userService(req, (resp: UserServiceResponse) => {
        // this.setState({loading: false})
        this.props.dispatch(push('/user/name?kid=' + this.props.kid))
      })
    )
  }

  render() {
    const kid = this.props.kid
    const key = this.state.key || keyEmpty()
    const users = key.users || []

    return (
      <Box>
        <Divider style={{marginBottom: 8}} />
        {this.state.error !== '' && <Typography style={{color: 'red'}}>{this.state.error}</Typography>}
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
                {users.length === 0 && (
                  <Link onClick={() => this.selectService('github')}>Link to Github</Link>
                )}
                {users.length === 0 && (
                  <Link onClick={() => this.selectService('twitter')}>Link to Twitter</Link>
                )}
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
          kid={this.props.kid}
          seq={this.state.revoke}
          open={this.state.revoke > 0}
          close={() => this.setState({revoke: 0})}
          dispatch={this.props.dispatch}
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

const mapStateToProps = (state: {rpc: RPCState, router: any}, ownProps: any) => {
  return {kid: selectedKID(state)}
}

// $FlowFixMe
export default connect(mapStateToProps)(ProfileView)
