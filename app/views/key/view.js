// @flow
import React, {Component} from 'react'

import {Box, Button, Divider, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {shell} from 'electron'

import {styles, Link} from '../components'
import {NameView} from '../user/views'

import {connect} from 'react-redux'
import queryString from 'query-string'

import {goBack, push} from 'connected-react-router'

import {keyTypeString, keyTypeSymbol, dateString} from '../helper'

import SigchainView from './sigchain'
import UserRevokeDialog from '../user/revoke'

import {key, keyRemove, pull, push as publish, userService} from '../../rpc/rpc'
import type {AppState, RPCState} from '../../reducers/app'

import type {Key, KeyType, Statement, User} from '../../rpc/types'

import type {
  KeyRequest,
  KeyResponse,
  KeyRemoveRequest,
  KeyRemoveResponse,
  PullRequest,
  PullResponse,
  PushRequest,
  PushResponse,
  UserServiceRequest,
  UserServiceResponse,
  RPCError,
} from '../../rpc/rpc'

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

export const IDView = (props: {id: string}) => {
  return (
    <Typography style={{...styles.mono, wordWrap: 'break-word', wordBreak: 'break-all'}}>
      {props.id}
    </Typography>
  )
}

export const KeyTypeView = (props: {type: KeyType, description: boolean}) => {
  return <Typography>{props.description ? keyTypeString(props.type) : keyTypeSymbol(props.type)}</Typography>
}

type Props = {
  kid: string,
  dispatch: (action: any) => any,
}

type State = {
  key: ?Key,
  statements: Array<Statement>,
  revoke: number,
  loading: boolean,
  error: string,
}

class KeyView extends Component<Props, State> {
  state = {
    loading: false,
    key: null,
    revoke: 0,
    statements: [],
    error: '',
  }

  componentDidMount() {
    this.loadKey()
  }

  selectService = (service: string) => {
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

  loadKey = () => {
    this.setState({loading: true, error: ''})
    const req: KeyRequest = {
      kid: this.props.kid,
      user: '',
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

  add = () => {
    this.setState({loading: true, error: ''})
    const req: PullRequest = {
      kid: this.props.kid,
      user: '',
    }
    this.props.dispatch(
      pull(
        req,
        (resp: PullResponse) => {
          this.setState({loading: false})
          this.loadKey()
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  remove = () => {
    const req: KeyRemoveRequest = {
      kid: this.props.kid,
      seedPhrase: '',
    }
    this.props.dispatch(
      keyRemove(
        req,
        (resp: KeyRemoveResponse) => {
          this.props.dispatch(goBack())
        },
        (err: RPCError) => {
          this.setState({error: err.message})
        }
      )
    )
  }

  render() {
    const kid = this.props.kid

    const loading = !this.state.key
    const type = (this.state.key && this.state.key.type) || 'NO_KEY_TYPE'
    const saved = this.state.key && this.state.key.saved
    const users = (this.state.key && this.state.key.users) || []

    const isPublic = type == 'PUBLIC_KEY_TYPE'
    const isPrivate = type == 'PRIVATE_KEY_TYPE'
    const add = !saved && isPublic
    const remove = saved && isPublic

    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell style={{...cstyles.cell, width: 100}}>
                <Typography align="right">Public Key</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <IDView id={kid} />
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">{users.length < 2 ? 'User' : 'Users'}</Typography>
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
                {isPublic && users.length == 0 && <Typography style={{color: '#9f9f9f'}}>none</Typography>}
                {isPrivate && users.length === 0 && (
                  <Link onClick={() => this.selectService('github')}>Link to Github</Link>
                )}
                {isPrivate && users.length === 0 && (
                  <Link onClick={() => this.selectService('twitter')}>Link to Twitter</Link>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">Type</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <KeyTypeView type={type} description />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}></TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="row">
                  {add && (
                    <Button size="small" color="primary" variant="outlined" onClick={this.add}>
                      Add
                    </Button>
                  )}
                  {remove && (
                    <Button size="small" color="secondary" variant="outlined" onClick={this.remove}>
                      Remove
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <SigchainView statements={this.state.statements} />
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

const mapStateToProps = (state: {rpc: RPCState, router: any}, ownProps: any) => {
  const values = queryString.parse(state.router.location.search)
  return {
    kid: (values.kid || '').toString(),
  }
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(KeyView)
