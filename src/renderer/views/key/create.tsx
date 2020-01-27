import * as React from 'react'

import * as electron from 'electron'

import {Box, Button, Divider, Input, InputLabel, FormControl, Typography} from '@material-ui/core'
import {Step, Link} from '../../components'

import {keyGenerate} from '../../rpc/rpc'

import {replace} from 'connected-react-router'

import {connect} from 'react-redux'

import {query} from '../state'
import {store} from '../../store'

import {RPCState} from '../../rpc/rpc'
import {KeyGenerateRequest, KeyGenerateResponse, KeyType} from '../../rpc/types'
import {State as RState} from '../state'

type Props = {
  type: KeyType
}

type State = {
  loading: boolean
}

class KeyCreateView extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  keyGenerate = () => {
    this.setState({loading: true})
    const req: KeyGenerateRequest = {
      type: this.props.type,
    }
    store.dispatch(
      keyGenerate(req, (resp: KeyGenerateResponse) => {
        this.setState({loading: false})
        store.dispatch(replace('/keys/key/index?kid=' + resp.kid))
      })
    )
  }

  render() {
    return (
      <Box>
        <Divider />
        <Box marginTop={2} marginLeft={2}>
          <Box marginBottom={2}>
            <Typography>Generate a {this.props.type} key.</Typography>
          </Box>

          <Box display="flex" flexDirection="row" alignSelf="center">
            <Button
              color="primary"
              variant="outlined"
              size="large"
              onClick={this.keyGenerate}
              disabled={this.state.loading}
            >
              Generate a Key
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }
}

const keyTypeFromString = (s: string, dflt: KeyType): KeyType => {
  if (!s) return dflt
  switch (s) {
    case KeyType.ED25519:
      return KeyType.ED25519
    case KeyType.CURVE25519:
      return KeyType.CURVE25519
  }
  return KeyType.UNKNOWN_KEY_TYPE
}

const mapStateToProps = (state: RState, ownProps: any) => {
  let type: KeyType = keyTypeFromString(query(state, 'type'), KeyType.ED25519)

  return {
    type: type,
  }
}

export default connect(mapStateToProps)(KeyCreateView)
