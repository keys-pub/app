import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Box, Typography} from '@material-ui/core'

import {styles} from '../../components'

import {query} from '../state'
import {store} from '../../store'
import {push} from 'connected-react-router'

import {verify, RPCError, RPCState} from '../../rpc/rpc'

import {VerifyRequest, VerifyResponse} from '../../rpc/types'

export type Props = {}

type State = {
  error: string
  loading: boolean
  value: string
}

class VerifyView extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
    value: '',
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', error: ''})
  }

  verify = () => {
    this.setState({loading: true, error: ''})
    const data = new TextEncoder().encode(this.state.value)
    const req: VerifyRequest = {
      data: data,
      armored: true,
    }
    store.dispatch(
      verify(
        req,
        (resp: VerifyResponse) => {
          this.setState({loading: false, error: ''})
          store.dispatch(push('/verify/verified'))
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
          <Button color="primary" variant="outlined" onClick={this.verify} disabled={this.state.loading}>
            Verify
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
  return {}
}
export default connect(mapStateToProps)(VerifyView)
