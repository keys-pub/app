import * as React from 'react'

import {Box, Divider, Input} from '@material-ui/core'

import {store} from '../../store'

import SignerView from './signer'

import {verify, RPCError, RPCState} from '../../rpc/rpc'

import {Key, VerifyRequest, VerifyResponse} from '../../rpc/types'

export type Props = {
  value: string
}

type State = {
  verified: string
  signer: Key
  error: string
}

export default class VerifiedView extends React.Component<Props, State> {
  state = {
    signer: null,
    verified: '',
    error: '',
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.verify()
    }
  }

  verify = () => {
    this.setState({error: '', signer: null, verified: ''})

    if (this.props.value == '') return

    const data = new TextEncoder().encode(this.props.value)
    const req: VerifyRequest = {
      data: data,
      armored: true,
    }
    store.dispatch(
      verify(
        req,
        (resp: VerifyResponse) => {
          const verified = new TextDecoder().decode(resp.data)
          this.setState({error: '', signer: resp.signer, verified})
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
        <SignerView signer={this.state.signer} />
        <Divider />
        <Input
          multiline
          readOnly
          value={this.state.verified}
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
      </Box>
    )
  }
}
