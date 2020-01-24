import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {push} from 'connected-react-router'

import {store} from '../../store'
import {query} from '../state'

import SignKeySelectView from '../keys/skselect'

import {sign, RPCError, RPCState} from '../../rpc/rpc'

import {Key, SignRequest, SignResponse} from '../../rpc/types'

export type Props = {
  kid: string
}

type State = {
  error: string
  loading: boolean
  kid: string
  value: string
}

class SignView extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
    kid: this.props.kid,
    value: '',
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', error: ''})
  }

  sign = () => {
    this.setState({loading: true, error: ''})

    const data = new TextEncoder().encode(this.state.value)
    const req: SignRequest = {
      data: data,
      armored: true,
      kid: this.state.kid,
    }
    store.dispatch(
      sign(
        req,
        (resp: SignResponse) => {
          this.setState({loading: false, error: ''})
          store.dispatch(push('/sign/signed'))
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  setSigner = (kid: string) => {
    console.log('Set signer:', kid)
    this.setState({kid: kid})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <SignKeySelectView defaultValue={this.props.kid} onChange={this.setSigner} />
        <Input
          multiline
          autoFocus
          onChange={this.onInputChange}
          value={this.state.value}
          disableUnderline
          inputProps={{
            style: {
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
          <Button color="primary" variant="outlined" onClick={this.sign} disabled={this.state.loading}>
            Sign
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
export default connect(mapStateToProps)(SignView)
