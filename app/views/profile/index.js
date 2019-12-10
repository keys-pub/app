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
import UserIntroDialog from './user/dialog'
import AuthPublishDialog from '../auth/publish'

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

class ProfileView extends Component<Props> {
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

  promptPublish = () => {
    this.props.dispatch({type: 'PROMPT_PUBLISH', payload: true})
  }

  render() {
    const {status} = this.props
    const key = status.key || keyEmpty()
    const kid = key.kid || ''
    const users = key.users || []
    const {uri} = status

    const createdAt = dateString(key.createdAt)
    const publishedAt = dateString(key.publishedAt)
    const savedAt = dateString(key.savedAt)
    const updatedAt = dateString(key.updatedAt)

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
                  <Typography style={{paddingTop: 2, color: '#666'}}>
                    You can share this public key with others.
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
                  <Box display="flex" flexDirection="column" key={user.kid}>
                    <NameView user={user} />
                    <Link onClick={() => shell.openExternal(user.url)}>{user.url}</Link>
                  </Box>
                ))}
                {users.length === 0 && <Link onClick={() => this.select('github')}>Link to Github</Link>}
                {users.length === 0 && <Link onClick={() => this.select('twitter')}>Link to Twitter</Link>}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <Typography align="right">Created</Typography>
                  <Typography align="right">Published</Typography>
                  <Typography align="right">Updated</Typography>
                </Box>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <Typography>{createdAt || '-'}</Typography>
                  <Typography>{publishedAt || '-'}</Typography>
                  <Typography>{updatedAt || '-'}</Typography>
                </Box>

                {!publishedAt && <Link onClick={() => this.promptPublish()}>Publish Key</Link>}
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
        <UserIntroDialog />
        <AuthPublishDialog />
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
  key: {
    width: 100,
  },
}

const mapStateToProps = (state: {app: AppState, rpc: RPCState}, ownProps: any): any => {
  const status = currentStatus(state.rpc)
  return {
    status,
  }
}

// $FlowFixMe
export default connect(mapStateToProps)(ProfileView)
