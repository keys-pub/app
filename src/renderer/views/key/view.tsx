import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import * as electron from 'electron'
import * as queryString from 'query-string'

import {styles, Link} from '../../components'
import {NameView} from '../user/views'

import {connect} from 'react-redux'

import {goBack, push} from 'connected-react-router'

import {keyDescription, keySymbol} from '../helper'

import {store} from '../../store'

import SigchainView from './sigchain'
import UserRevokeDialog from '../user/revoke'

import {key, keyRemove, pull, userService, RPCError, RPCState} from '../../rpc/rpc'

import {
  Key,
  Statement,
  User,
  KeyRequest,
  KeyResponse,
  KeyRemoveRequest,
  KeyRemoveResponse,
  PullRequest,
  PullResponse,
  UserServiceRequest,
  UserServiceResponse,
  KeyType,
} from '../../rpc/types'

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

export const IDView = (props: {id: string; owner?: boolean}) => {
  const styl = {}
  if (props.owner) styl['fontWeight'] = 600
  // width: 520, wordWrap: 'break-word', wordBreak: 'break-all'
  return <Typography style={{...styles.mono, ...styl}}>{props.id}</Typography>
}

export const KeyDescriptionView = (props: {value: Key}) => {
  return <Typography>{keyDescription(props.value)}</Typography>
}

export const KeySymbolView = (props: {value: Key}) => {
  return <Typography>{keySymbol(props.value)}</Typography>
}

type Props = {
  kid: string
}

interface State {
  key: Key
  statements: Statement[]
  revoke: number
  loading: boolean
  error: string
}

class KeyView extends React.Component<Props, State> {
  state = {
    loading: false,
    key: {} as Key,
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
    store.dispatch(
      userService(req, (resp: UserServiceResponse) => {
        // this.setState({loading: false})
        store.dispatch(push('/user/name?kid=' + this.props.kid))
      })
    )
  }

  loadKey = () => {
    this.setState({loading: true, error: ''})
    const req: KeyRequest = {
      kid: this.props.kid,
      user: '',
    }
    store.dispatch(
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
          this.setState({loading: false, error: err.details})
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
    store.dispatch(
      pull(
        req,
        (resp: PullResponse) => {
          this.setState({loading: false})
          this.loadKey()
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.details})
        }
      )
    )
  }

  remove = () => {
    const req: KeyRemoveRequest = {
      kid: this.props.kid,
    }
    store.dispatch(
      keyRemove(
        req,
        (resp: KeyRemoveResponse) => {
          store.dispatch(goBack())
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  render() {
    const kid = this.props.kid

    const loading = this.state.loading
    const saved = this.state.key && this.state.key.saved
    const users = (this.state.key && this.state.key.users) || []

    let hasGithub = false
    let hasTwitter = false
    users.map(user => {
      if (user.service === 'twitter') hasTwitter = true
      if (user.service === 'github') hasGithub = true
    })

    const isPrivate = this.state.key.type == KeyType.CURVE25519 || this.state.key.type == KeyType.ED25519
    const isPublic =
      this.state.key.type == KeyType.CURVE25519_PUBLIC || this.state.key.type == KeyType.ED25519_PUBLIC
    const add = !saved && isPublic
    const remove = saved && isPublic

    return (
      <Box display="flex" flex={1} flexDirection="column">
        {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}
        {this.state.error && (
          <Typography style={{color: 'red', marginLeft: 30}}>{this.state.error}</Typography>
        )}
        <Box paddingBottom={1} />
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell style={{...cstyles.cell, width: 100}}>
                <Typography align="right">ID</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                <Box display="flex" flexDirection="column">
                  <IDView id={kid} />
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">Type</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                {this.state.key && <KeyDescriptionView value={this.state.key} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={cstyles.cell}>
                <Typography align="right">{users.length < 2 ? 'User' : 'Users'}</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                {users.length == 0 && <Typography style={{color: '#999'}}>none</Typography>}
                {users.map((user: User) => (
                  <Box
                    display="flex"
                    flexDirection="column"
                    key={'user-' + user.kid + '-' + user.seq}
                    paddingBottom={2}
                  >
                    <NameView user={user} />
                    {user.err && <Typography style={{color: 'red'}}>{user.err}</Typography>}
                    <Link onClick={() => electron.shell.openExternal(user.url)}>{user.url}</Link>
                    {isPrivate && (
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
                    )}
                  </Box>
                ))}
                {isPublic && users.length == 0 && <Typography style={{color: '#9f9f9f'}}>none</Typography>}
                {isPrivate && !hasGithub && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => this.selectService('github')}
                    style={{marginRight: 10}}
                  >
                    Link to Github
                  </Button>
                )}
                {isPrivate && !hasTwitter && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => this.selectService('twitter')}
                    style={{marginRight: 10}}
                  >
                    Link to Twitter
                  </Button>
                )}
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
        />
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  const values = queryString.parse(state.router.location.search)
  return {
    kid: (values.kid || '').toString(),
  }
}

export default connect(mapStateToProps)(KeyView)
