// @flow
import React, {Component} from 'react'

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

import {styles, Link} from '../components'
import {NamesView} from '../user/views'

import KeyView from './view'
import KeyLoadingView from './loading'

import {connect} from 'react-redux'
import queryString from 'query-string'
import {goBack, push} from 'connected-react-router'

import {key, keyRemove, pull, sigchain} from '../../rpc/rpc'
import type {AppState, RPCState} from '../../reducers/app'

import type {Key, Statement} from '../../rpc/types'
import type {
  KeyRemoveRequest,
  KeyRemoveResponse,
  KeyRequest,
  KeyResponse,
  PullRequest,
  PullResponse,
  SigchainRequest,
  SigchainResponse,
  RPCError,
} from '../../rpc/rpc'

type Props = {
  kid: string,
  dispatch: (action: any) => any,
}

type State = {
  key: ?Key,
  statements: ?Array<Statement>,
  loading: boolean,
  error: ?string,
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

class KeyIndexView extends Component<Props, State> {
  state = {
    key: null,
    statements: [],
    loading: false,
    error: null,
  }

  componentDidMount() {
    this.loadKey()
  }

  loadKey = () => {
    this.setState({loading: true, error: ''})
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

  loadSigchain = () => {
    this.setState({loading: true, error: ''})
    const req: SigchainRequest = {
      kid: this.props.kid,
      check: true,
      update: true,
    }
    this.props.dispatch(
      sigchain(
        req,
        (resp: SigchainResponse) => {
          if (resp.key) {
            this.setState({key: resp.key, statements: resp.statements, loading: false})
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

  render() {
    const {loading} = this.state
    return (
      <Box display="flex" flexDirection="column">
        {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}
        <Box marginTop={3}>
          {this.state.error && (
            <Typography style={{color: 'red', marginLeft: 30}}>{this.state.error}</Typography>
          )}
          {this.state.loading && <KeyLoadingView kid={this.props.kid} />}
          {!this.state.error && !this.state.loading && this.state.key && (
            <KeyView
              kval={this.state.key}
              statements={this.state.statements || []}
              dispatch={this.props.dispatch}
            />
          )}
        </Box>
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

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(KeyIndexView)
