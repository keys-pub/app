import * as React from 'react'

import {
  Box,
  Button,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {keyRemove} from '../../rpc/rpc'
import {selectedKID} from '../state'

import {Step} from '../../components'

import {goBack} from 'connected-react-router'
import {connect} from 'react-redux'

import {RPCError, RPCState} from '../../rpc/rpc'
import {KeyRemoveRequest, KeyRemoveResponse} from '../../rpc/types'

type Props = {
  kid: string
  dispatch: (action: any) => any
}

type State = {
  error: string
}

class KeyRemoveView extends React.Component<Props, State> {
  state = {
    error: '',
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  removeKey = () => {
    const req: KeyRemoveRequest = {kid: this.props.kid}
    this.props.dispatch(
      keyRemove(
        req,
        (resp: KeyRemoveResponse) => {
          // TODO
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  render() {
    return (
      <Step
        title="Remove a Key"
        prev={{label: 'Cancel', action: () => this.props.dispatch(goBack())}}
        next={{label: 'Yes, Delete', action: this.removeKey}}
      >
        <Typography style={{paddingBottom: 20}}>
          Are you really sure you want to delete your key? If you haven't backed up your key, you won't be
          able to recover it.
        </Typography>
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {kid: selectedKID(state)}
}

export default connect(mapStateToProps)(KeyRemoveView)
