import * as React from 'react'

import * as electron from 'electron'

import {
  Box,
  Button,
  Divider,
  Input,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core'
import {Step, Link} from '../../components'

import {keyGenerate} from '../../rpc/rpc'

import {goBack, replace} from 'connected-react-router'

import {connect} from 'react-redux'

import {query} from '../state'
import {store} from '../../store'

import {RPCState} from '../../rpc/rpc'
import {KeyGenerateRequest, KeyGenerateResponse, KeyType} from '../../rpc/types'
import {State as RState} from '../state'

type Props = {
  defaultType: KeyType
}

type State = {
  loading: boolean
  type: KeyType
}

class KeyCreateView extends React.Component<Props, State> {
  state = {
    loading: false,
    type: KeyType.EDX25519,
  }

  keyGenerate = () => {
    this.setState({loading: true})
    const req: KeyGenerateRequest = {
      type: this.props.defaultType,
    }
    store.dispatch(
      keyGenerate(req, (resp: KeyGenerateResponse) => {
        this.setState({loading: false})
        store.dispatch(replace('/keys/key/index?kid=' + resp.kid))
      })
    )
  }

  setType = (event: React.ChangeEvent<{value: unknown}>) => {
    const type = event.target.value as KeyType
    this.setState({type})
  }

  renderSelect() {
    return (
      <FormControl variant="outlined">
        <Select value={this.state.type} onChange={this.setType}>
          <MenuItem value={KeyType.EDX25519}>
            Signing/Encryption (EdX25519)<span style={{color: '#999999'}}>&nbsp;(recommended)</span>
          </MenuItem>
          <MenuItem value={KeyType.X25519}>Encryption (X25519)</MenuItem>
        </Select>
      </FormControl>
    )
  }

  render() {
    return (
      <Step
        title="Generate a Key"
        prev={{label: 'Cancel', action: () => store.dispatch(goBack())}}
        next={{label: 'Generate', action: this.keyGenerate}}
      >
        <Box display="flex" flexDirection="column" flex={1} width={500}>
          {this.renderSelect()}
          <Box margin={1} />
          <Typography>{keyDescription(this.state.type)}</Typography>
          <Box margin={1} />
        </Box>
      </Step>
    )
  }
}

const keyTypeFromString = (s: string, dflt: KeyType): KeyType => {
  if (!s) return dflt
  switch (s) {
    case KeyType.EDX25519:
      return KeyType.EDX25519
    case KeyType.X25519:
      return KeyType.X25519
  }
  return KeyType.UNKNOWN_KEY_TYPE
}

const keyDescription = (type: KeyType): string => {
  switch (type) {
    case KeyType.EDX25519:
      return `Ed25519 is an elliptic curve signing algorithm using EdDSA and Curve25519. 
      This key can be converted to a X25519, so it can also be used for public key authenticated encryption.`
    case KeyType.X25519:
      return 'X25519 keys are used for public key authenticated encryption. X25519 is an elliptic curve Diffie-Hellman key exchange using Curve25519.'
  }
}

const mapStateToProps = (state: RState, ownProps: any) => {
  let type: KeyType = keyTypeFromString(query(state, 'type'), KeyType.EDX25519)

  return {
    defaultType: type,
  }
}

export default connect(mapStateToProps)(KeyCreateView)
