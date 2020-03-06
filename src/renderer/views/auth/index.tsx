import * as React from 'react'

import AuthSetupView from './setup'
import AuthUnlockView from './unlock'
import AuthSplash from './splash'
import ErrorsView from '../../errors'

import {client} from '../../rpc/client'

import {RPCError, RuntimeStatusRequest, RuntimeStatusResponse} from '../../rpc/types'

type Props = {}

type State = {
  loading: boolean
  authSetupNeeded: boolean
  error: RPCError | void
}

export default class AuthView extends React.Component<Props, State> {
  state = {
    loading: true,
    authSetupNeeded: false,
    error: null,
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = async () => {
    const req: RuntimeStatusRequest = {}
    const cl = await client()
    cl.runtimeStatus(req, (err: RPCError, resp: RuntimeStatusResponse) => {
      if (err) {
        this.setState({error: err})
        return
      }
      this.setState({loading: false, authSetupNeeded: resp.authSetupNeeded})
    })
  }

  render() {
    if (this.state.error) {
      return <ErrorsView error={this.state.error} />
    }
    if (this.state.loading) {
      return <AuthSplash />
    }

    if (this.state.authSetupNeeded) {
      return <AuthSetupView />
    } else {
      return <AuthUnlockView />
    }
  }
}
