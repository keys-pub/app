// @flow
import React, {Component} from 'react'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {Button, Divider, LinearProgress, MenuItem, Paper, Typography, Box} from '@material-ui/core'

import Recipients from './recipients'
import Editor from './editor'

import {styles} from '../components'
import {fade} from '@material-ui/core/styles/colorManipulator'

import {search, messageCreate} from '../../rpc/rpc'
import type {Key, SearchResult} from '../../rpc/types'
import type {
  MessageCreateRequest,
  MessageCreateResponse,
  RPCError,
  RPCState,
  SearchResponse,
} from '../../rpc/rpc'

export type Props = {
  dispatch: (action: any) => any,
}

type State = {
  results: Array<SearchResult>,
  loading: boolean,
}

class ComposeView extends Component<Props, State> {
  state = {
    loading: false,
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

  send = (text: string) => {}

  // send = (text: string) => {
  //   const kids = this.state.users.map((u: User): string => {
  //     return u.kid
  //   })
  //   kids.push(this.props.sender.kid)
  //   const address = kids.sort().join(':')

  //   console.log('Users', this.state.users)
  //   console.log('Sender', this.props.sender.kid)
  //   console.log('Send', text)
  //   console.log('Address', address)

  //   const req: MessageCreateRequest = {kid: '', sender: this.props.sender.kid, id: '', text}
  //   this.setState({loading: true})
  //   this.props.dispatch(
  //     messageCreate(
  //       req,
  //       (resp: MessageCreateResponse) => {
  //         this.setState({loading: false})
  //         //this.props.dispatch(goBack())
  //       },
  //       (err: RPCError) => {
  //         this.setState({loading: false})
  //         // TODO
  //       }
  //     )
  //   )
  // }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        {!this.state.loading && <Divider style={{marginBottom: 3}} />}
        {this.state.loading && <LinearProgress />}
        {/*<Recipients search={this.search} select={this.select} />*/}
        <Divider />
        <Editor defaultValue="" send={this.send} loading={this.state.loading} />
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}) => {
  return {}
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(ComposeView)
