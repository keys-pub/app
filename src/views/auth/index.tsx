import * as React from 'react'

import {Box, Button, Dialog, Divider, Typography} from '@material-ui/core'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import AuthIntroView from './intro'
import AuthUnlockView from './unlock'

import {runtimeStatus} from '../../rpc/rpc'

import {RuntimeStatusRequest} from '../../rpc/types'
import {RPCState} from '../../rpc/rpc'

type Props = {
  loading: boolean
  authSetupNeeded: boolean
  dispatch: (action: any) => any
}

class AuthView extends React.Component<Props> {
  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    const req: RuntimeStatusRequest = {}
    this.props.dispatch(runtimeStatus(req))
  }

  render() {
    if (this.props.loading) return null
    if (this.props.authSetupNeeded) {
      return <AuthIntroView />
    } else {
      return <AuthUnlockView />
    }
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  if (!state.rpc.runtimeStatus) {
    return {loading: true, authSetupNeeded: true}
  }
  return {loading: false, authSetupNeeded: state.rpc.runtimeStatus.authSetupNeeded}
}

export default connect(mapStateToProps)(AuthView)
