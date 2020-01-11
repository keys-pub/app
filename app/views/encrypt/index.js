// @flow
import React, {Component} from 'react'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {Button, Divider, LinearProgress, MenuItem, Paper, TextField, Typography, Box} from '@material-ui/core'

import {styles} from '../components'

import RecipientsView from '../recipients'

import {selectedKID} from '../state'

import {search, encrypt} from '../../rpc/rpc'
import type {EncryptRequest, EncryptResponse, Key, SearchResult, SearchResponse} from '../../rpc/types'
import type {RPCError, RPCState} from '../../rpc/rpc'

export type Props = {
  kid: string,
  dispatch: (action: any) => any,
}

type State = {
  error: string,
  results: Array<SearchResult>,
  loading: boolean,
  value: string,
}

class EncryptView extends Component<Props, State> {
  state = {
    error: '',
    loading: false,
    value: '',
    results: [],
  }

  search = (q: string): Promise<Array<SearchResult>> => {
    return new Promise((resolve, reject) => {
      this.props.dispatch(
        search(
          {query: q, index: 0, limit: 100},
          (resp: SearchResponse) => {
            resolve(resp.results || [])
          },
          (err: RPCError) => {
            reject(err)
          }
        )
      )
    })
  }

  select = (results: Array<SearchResult>) => {
    this.setState({results})
  }

  encrypt = (text: string) => {
    this.setState({loading: true, error: ''})
    const req: EncryptRequest = {
      data: text,
      armored: true,
      recipients: '',
      sender: this.props.kid,
    }
    this.props.dispatch(
      encrypt(
        req,
        (resp: EncryptResponse) => {
          this.setState({loading: false, error: ''})
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({value: (e.target && e.target.value) || '', error: ''})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        {!this.state.loading && <Divider style={{marginBottom: 3}} />}
        {this.state.loading && <LinearProgress />}

        <Box style={{marginTop: -3}} />
        <RecipientsView />

        <Divider />
        <TextField
          multiline
          autoFocus
          placeholder={''}
          onChange={this.onInputChange}
          value={this.state.value}
          inputProps={{
            style: {height: '100%', paddingLeft: 10, paddingTop: 10},
          }}
          InputProps={{
            style: {height: '100%'},
          }}
          style={{height: '100%'}}
        />
        <Divider />
        <Box
          display="flex"
          flexDirection="row"
          style={{
            paddingLeft: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingRight: 20,
          }}
        >
          <Button color="primary" variant="outlined" onClick={this.encrypt} disabled={this.state.loading}>
            Encrypt
          </Button>
          <Box display="flex" flexDirection="row" flex={1} />
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState, router: any}, ownProps: any) => {
  return {
    kid: selectedKID(state),
  }
}
export default connect<Props, {}, _, _, _, _>(mapStateToProps)(EncryptView)
