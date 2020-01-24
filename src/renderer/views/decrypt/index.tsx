import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Box, Typography} from '@material-ui/core'

import {styles} from '../../components'
import {push} from 'connected-react-router'
import {store} from '../../store'
import {query} from '../state'

import {decrypt, RPCError, RPCState} from '../../rpc/rpc'

import {UserSearchResult, DecryptRequest, DecryptResponse} from '../../rpc/types'

export type Props = {
  kid: string
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
    store.dispatch(
      decrypt(
        req,
        (resp: DecryptResponse) => {
          this.setState({loading: false, error: ''})
          store.dispatch(push('/decrypt/decrypted'))
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Divider />
        <Input
          multiline
          autoFocus
          onChange={this.onInputChange}
          value={this.state.value}
          disableUnderline
          inputProps={{
            style: {
              ...styles.mono,
              height: '100%',
            },
          }}
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
          {this.state.error && (
            <Typography color="secondary" style={{paddingLeft: 20, alignSelf: 'center'}}>
              {this.state.error}
            </Typography>
          )}
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
