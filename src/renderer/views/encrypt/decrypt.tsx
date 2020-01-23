import * as React from 'react'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {Button, ButtonGroup, Divider, LinearProgress, Input, Box} from '@material-ui/core'

import {query} from '../state'

import {decrypt, RPCError, RPCState} from '../../rpc/rpc'

import {UserSearchResult, DecryptRequest, DecryptResponse} from '../../rpc/types'

export type Props = {
  kid: string
  dispatch: (action: any) => any
}

type State = {
  error: string
  results: Array<UserSearchResult>
  loading: boolean
  value: string
}

class EncryptView extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
    value: '',
    results: [],
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', error: ''})
  }

  decrypt = () => {
    this.setState({loading: true, error: ''})
    const data = new TextEncoder().encode(this.state.value)
    const req: DecryptRequest = {
      data: data,
      armored: true,
    }
    this.props.dispatch(
      decrypt(
        req,
        (resp: DecryptResponse) => {
          this.setState({loading: false})
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%', overflowX: 'hidden'}}>
        <Input
          multiline
          autoFocus
          onChange={this.onInputChange}
          value={this.state.value}
          disableUnderline
          style={{
            height: '100%',
            paddingLeft: 10,
            paddingTop: 10,
            overflowY: 'scroll',
          }}
        />
        {!this.state.loading && <Divider style={{marginBottom: 3}} />}
        {this.state.loading && <LinearProgress />}
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
          <Button color="primary" variant="outlined" onClick={this.decrypt} disabled={this.state.loading}>
            Decrypt
          </Button>
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
  }
}
export default connect(mapStateToProps)(EncryptView)
