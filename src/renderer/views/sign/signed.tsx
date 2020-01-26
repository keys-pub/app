import * as React from 'react'

import {Input, Box} from '@material-ui/core'

import {styles} from '../../components'

import {store} from '../../store'

import {debounce} from 'lodash'

import {sign, RPCError} from '../../rpc/rpc'

import {Key, SignRequest, SignResponse} from '../../rpc/types'

export type Props = {
  value: string
  kid: string
}

type State = {
  signed: string
  error: string
}

export default class SignedView extends React.Component<Props, State> {
  state = {
    signed: '',
    error: '',
  }
  // debounceSign = debounce(() => this.sign(), 10)

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.sign()
    }
  }

  sign = () => {
    this.setState({error: '', signed: ''})

    if (this.props.kid == '' || this.props.value == '') {
      return
    }

    this.setState({error: '', signed: ''})
    const data = new TextEncoder().encode(this.props.value)
    const req: SignRequest = {
      data: data,
      armored: true,
      kid: this.props.kid,
    }
    store.dispatch(
      sign(
        req,
        (resp: SignResponse) => {
          const signed = new TextDecoder('ascii').decode(resp.data)
          this.setState({error: '', signed})
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  render() {
    return (
      <Input
        multiline
        readOnly
        value={this.state.signed}
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
    )
  }
}
