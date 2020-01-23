import * as React from 'react'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {Button, Divider, LinearProgress, MenuItem, Paper, Typography, Box} from '@material-ui/core'

import Recipients from '../user/recipients'

import {styles} from '../../components'
import {fade} from '@material-ui/core/styles/colorManipulator'

import {UserSearchResult, UserSearchResponse} from '../../rpc/types'
import {userSearch, RPCError, RPCState} from '../../rpc/rpc'

export type Props = {
  dispatch: (action: any) => any
}

type State = {
  results: Array<UserSearchResult>
  loading: boolean
}

class ComposeView extends React.Component<Props, State> {
  state = {
    loading: false,
    results: [],
  }

  search = (q: string): Promise<Array<UserSearchResult>> => {
    return new Promise((resolve, reject) => {
      this.props.dispatch(
        userSearch(
          {query: q, limit: 100},
          (resp: UserSearchResponse) => {
            resolve(resp.results || [])
          },
          (err: RPCError) => {
            reject(err)
          }
        )
      )
    })
  }

  select = (results: Array<UserSearchResult>) => {
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
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}) => {
  return {}
}

export default connect(mapStateToProps)(ComposeView)
