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
import {NamesView} from '../profile/user/views'

import KeyView from './view'
import KeyLoadingView from './loading'

import {connect} from 'react-redux'
import queryString from 'query-string'
import {goBack, push} from 'connected-react-router'

import {key, keyRemove, pull} from '../../rpc/rpc'
import type {AppState, RPCState} from '../../reducers/app'

import type {Key} from '../../rpc/types'
import type {
  KeyRemoveRequest,
  KeyRemoveResponse,
  KeyRequest,
  KeyResponse,
  PullRequest,
  PullResponse,
  RPCError,
} from '../../rpc/rpc'

type Props = {
  kid: string,
  dispatch: (action: any) => any,
}

type State = {
  key: ?Key,
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
    loading: false,
    error: null,
  }

  componentDidMount() {
    this.loadKey()
  }

  add = () => {
    this.setState({loading: true})
    const req: PullRequest = {
      kid: this.props.kid,
      user: '',
      all: false,
    }
    this.props.dispatch(
      pull(
        req,
        (resp: PullResponse) => {
          this.loadKey()
        },
        (err: RPCError) => {
          this.setState({error: err.message, loading: false})
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

  loadKey = () => {
    this.setState({loading: true})
    const req: KeyRequest = {
      kid: this.props.kid,
      user: '',
      check: true,
      update: true,
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
          this.setState({error: err.message, loading: false})
        }
      )
    )
  }

  render() {
    const {loading} = this.state
    return (
      <Box display="flex" flexDirection="column">
        <Divider style={{marginBottom: 3}} />
        {/* {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}*/}
        <Box marginTop={3}>
          {this.state.error && (
            <Typography style={{color: 'red', marginLeft: 30}}>{this.state.error}</Typography>
          )}
          {this.state.loading && <KeyLoadingView kid={this.props.kid} />}
          {!this.state.error && !this.state.loading && this.state.key && (
            <KeyView value={this.state.key} add={this.add} remove={this.remove} />
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
