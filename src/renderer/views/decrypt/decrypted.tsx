import * as React from 'react'

import {Button, Divider, Input, Box} from '@material-ui/core'

import {store} from '../../store'

import {decrypt, RPCError} from '../../rpc/rpc'

import SignerView from '../verify/signer'

import {Key, UserSearchResult, DecryptRequest, DecryptResponse} from '../../rpc/types'
import {CSSProperties} from '@material-ui/styles'

export type Props = {
  value: string
}

type State = {
  decrypted: string
  sender: Key
  error: string
}

export default class DecryptedView extends React.Component<Props, State> {
  state = {
    decrypted: '',
    error: '',
    sender: null,
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.decrypt()
    }
  }

  decrypt = () => {
    this.setState({error: '', sender: null, decrypted: ''})

    if (this.props.value == '') return

    const data = new TextEncoder().encode(this.props.value)
    const req: DecryptRequest = {
      data: data,
      armored: true,
    }
    store.dispatch(
      decrypt(
        req,
        (resp: DecryptResponse) => {
          const decrypted = new TextDecoder().decode(resp.data)
          this.setState({error: '', sender: resp.sender, decrypted: decrypted})
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  render() {
    let value = ''
    let stylesInput: CSSProperties = {}
    if (this.state.error == 'unexpected EOF') {
      value = ''
    } else if (this.state.error) {
      value = this.state.error
      stylesInput.color = 'red'
    } else {
      value = this.state.decrypted
    }

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
        <SignerView signer={this.state.sender} />
        <Divider />
        <Input
          multiline
          readOnly
          value={value}
          disableUnderline
          inputProps={{
            style: {
              height: '100%',
            },
          }}
          style={{
            height: '100%',
            width: '100%',
            paddingLeft: 10,
            paddingTop: 10,
            overflowY: 'scroll',
          }}
        />
      </Box>
    )
  }
}
