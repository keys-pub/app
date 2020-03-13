import * as React from 'react'

import {Box, Divider, Input} from '@material-ui/core'

import {store} from '../../store'

import SignerView from './signer'

import {verify} from '../../rpc/rpc'
import {RPCError, Key, VerifyRequest, VerifyResponse} from '../../rpc/types'

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

  componentDidMount() {
    this.verify()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.verify()
    }
  }

  verify = () => {
    console.log('Verify...')
    this.setState({error: '', signer: null, verified: ''})

    if (this.props.value == '') return

    const data = new TextEncoder().encode(this.props.value)
    const req: VerifyRequest = {
      data: data,
      armored: true,
    }
    verify(req, (err: RPCError, resp: VerifyResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      const verified = new TextDecoder().decode(resp.data)
      this.setState({error: '', signer: resp.signer, verified})
    })
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
              overflow: 'auto',
              paddingTop: 8,
              paddingLeft: 8,
              paddingBottom: 0,
              paddingRight: 0,
            },
          }}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
      </Box>
    )
  }
}
