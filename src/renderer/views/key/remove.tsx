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
import {query} from '../state'

import {Step, styles} from '../../components'

import {go, goBack} from 'connected-react-router'
import {connect} from 'react-redux'
import {store} from '../../store'

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
          store.dispatch(go(-2))
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
        title="Delete Key"
        prev={{label: 'Cancel', action: () => this.props.dispatch(goBack())}}
        next={{label: 'Yes, Delete', action: this.removeKey}}
      >
        <Typography style={{paddingBottom: 20}}>Are you really sure you want to delete this key?</Typography>
        <Typography style={{...styles.mono, paddingBottom: 20}}>{this.props.kid}</Typography>
        <Typography style={{paddingBottom: 20}}>
          If you haven't backed up your key, you won't be able to recover it.
        </Typography>
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {kid: query(state, 'kid')}
}

export default connect(mapStateToProps)(KeyRemoveView)
