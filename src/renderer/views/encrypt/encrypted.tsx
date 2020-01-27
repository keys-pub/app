import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {styles} from '../../components'

import {store} from '../../store'

import {encrypt, RPCError} from '../../rpc/rpc'

import {UserSearchResult, EncryptRequest, EncryptResponse} from '../../rpc/types'
import {CSSProperties} from '@material-ui/styles'

export type Props = {
  value: string
  recipients: UserSearchResult[]
  sender: string
}

type State = {
  encrypted: string
  error: string
}

export default class EncryptedView extends React.Component<Props, State> {
  state = {
    encrypted: '',
    error: '',
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.encrypt()
    }
  }

  encrypt = () => {
    this.setState({error: '', encrypted: ''})

    const recs = this.props.recipients.map((r: UserSearchResult) => {
      return r.kid
    })

    if (recs.length == 0 || this.props.value == '') {
      return
    }

    const data = new TextEncoder().encode(this.props.value)
    const req: EncryptRequest = {
      data: data,
      armored: true,
      recipients: recs,
      sender: this.props.sender,
    }
    store.dispatch(
      encrypt(
        req,
        (resp: EncryptResponse) => {
          const encrypted = new TextDecoder().decode(resp.data)
          this.setState({error: '', encrypted: encrypted})
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
    if (this.state.error) {
      value = this.state.error
      stylesInput.color = 'red'
    } else {
      value = this.state.encrypted
    }

    return (
      <Input
        multiline
        readOnly
        value={value}
        disableUnderline
        inputProps={{
          style: {
            ...styles.mono,
            ...stylesInput,
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
    )
  }
}
