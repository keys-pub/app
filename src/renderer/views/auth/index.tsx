import * as React from 'react'

import AuthSetupView from './setup'
import AuthUnlockView from './unlock'
import AuthSplash from './splash'
import ErrorsView from '../../errors'

import {runtimeStatus} from '../../rpc/keys'
import {RPCError, RuntimeStatusRequest, RuntimeStatusResponse, AuthStatus} from '../../rpc/keys.d'

type Props = {}

type State = {
  loading: boolean
  authStatus: AuthStatus
  error: RPCError | void
}

export default class AuthView extends React.Component<Props, State> {
  state = {
    loading: true,
    authStatus: AuthStatus.AUTH_UNKNOWN,
    error: null,
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    const req: RuntimeStatusRequest = {}
    runtimeStatus(req, (err: RPCError, resp: RuntimeStatusResponse) => {
      if (err) {
        this.setState({loading: false, error: err})
        return
      }
      console.log('Auth status:', resp.authStatus)
      this.setState({loading: false, authStatus: resp.authStatus})
    })
  }

  render() {
    if (this.state.error) {
      return <ErrorsView error={this.state.error} />
    }
    if (this.state.loading || this.state.authStatus == AuthStatus.AUTH_UNKNOWN) {
      return <AuthSplash />
    }

    if (this.state.authStatus == AuthStatus.AUTH_SETUP) {
      return <AuthSetupView refresh={this.refresh} />
    } else {
      return <AuthUnlockView />
    }
  }
}
