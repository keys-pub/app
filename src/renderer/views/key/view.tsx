import * as React from 'react'

import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import * as electron from 'electron'

import {styles, Link} from '../../components'
import UserLabel from '../user/label'

import {connect} from 'react-redux'
import {query} from '../state'

import {goBack, push} from 'connected-react-router'

import {keyDescription} from '../helper'

import {store} from '../../store'

import SigchainView from './sigchain'
import UserSignDialog from '../user/dialog'
import UserRevokeDialog from '../user/revoke'
import KeyRemoveDialog from './remove'
import KeyExportDialog from '../export'

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

type Props = {
  kid: string
}

interface State {
  key: Key
  statements: Statement[]
  openRevoke: number
  loading: boolean
  error: string
  openRemove: boolean
  openExport: boolean
  openUserSign: string // '' | 'twitter' | 'github'
}

class KeyView extends React.Component<Props, State> {
  state = {
    loading: false,
    key: {} as Key,
    openRemove: false,
    openExport: false,
    openRevoke: 0,
    openUserSign: '',
    statements: [],
    error: '',
  }

  componentDidMount() {
    this.loadKey()
  }

  selectService = (service: string) => {
    this.setState({openUserSign: service})
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

  export = () => {
    this.setState({openExport: true})
  }

  removePublic = () => {
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

  render() {
    const kid = this.props.kid

    const loading = this.state.loading
    const saved = this.state.key && this.state.key.saved
    const user = this.state.key && this.state.key.user

    const signable = this.state.key.type == KeyType.EDX25519
    const isPrivate = this.state.key.type == KeyType.X25519 || this.state.key.type == KeyType.EDX25519
    const isPublic =
      this.state.key.type == KeyType.X25519_PUBLIC || this.state.key.type == KeyType.EDX25519_PUBLIC
    const add = !saved && isPublic
    const remove = saved && isPublic
    const removePrivate = isPrivate

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
                <Typography align="right">User</Typography>
              </TableCell>
              <TableCell style={cstyles.cell}>
                {this.state.key.id && (!isPrivate || !signable) && !user && (
                  <Typography style={{color: '#999'}}>none</Typography>
                )}
                {user && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    key={'user-' + user.kid + '-' + user.seq}
                    paddingBottom={2}
                  >
                    <UserLabel kid={user.kid} user={user} />
                    {user.err && <Typography style={{color: 'red'}}>{user.err}</Typography>}
                    <Link onClick={() => electron.shell.openExternal(user.url)}>{user.url}</Link>
                    {isPrivate && (
                      <Box>
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => this.setState({openRevoke: user.seq})}
                        >
                          Revoke
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
                {signable && !user && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => this.selectService('github')}
                    style={{marginRight: 10}}
                  >
                    Link to Github
                  </Button>
                )}
                {signable && !user && (
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
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={this.add}
                      style={{marginRight: 10}}
                    >
                      Add
                    </Button>
                  )}
                  {remove && (
                    <Button
                      size="small"
                      color="secondary"
                      variant="outlined"
                      onClick={this.removePublic}
                      style={{marginRight: 10}}
                    >
                      Remove
                    </Button>
                  )}
                  {isPrivate && (
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={this.export}
                      style={{marginRight: 10}}
                    >
                      Export
                    </Button>
                  )}
                  {removePrivate && (
                    <Button
                      size="small"
                      color="secondary"
                      variant="outlined"
                      onClick={() => this.setState({openRemove: true})}
                      style={{marginRight: 10}}
                    >
                      Delete
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
          seq={this.state.openRevoke}
          open={this.state.openRevoke > 0}
          close={() => this.setState({openRevoke: 0})}
        />
        <KeyRemoveDialog open={this.state.openRemove} kid={this.props.kid} close={this.closeRemove} />
        <KeyExportDialog open={this.state.openExport} kid={this.props.kid} close={this.closeExport} />
        <UserSignDialog
          kid={this.props.kid}
          service={this.state.openUserSign}
          open={this.state.openUserSign != ''}
          close={this.closeUserSign}
        />
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
  }
}

export default connect(mapStateToProps)(KeyView)
