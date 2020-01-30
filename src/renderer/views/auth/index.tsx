import * as React from 'react'

import {store} from '../../store'

import AuthSetupView from './setup'
import AuthUnlockView from './unlock'

import {runtimeStatus} from '../../rpc/rpc'

import {RuntimeStatusRequest, RuntimeStatusResponse} from '../../rpc/types'

type Props = {}

type State = {
  loading: boolean
  authSetupNeeded: boolean
}

export default class AuthView extends React.Component<Props, State> {
  state = {
    loading: true,
    authSetupNeeded: false,
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    const req: RuntimeStatusRequest = {}
    store.dispatch(
      runtimeStatus(req, (resp: RuntimeStatusResponse) => {
        this.setState({loading: false, authSetupNeeded: resp.authSetupNeeded})
      })
    )
  }

  render() {
    if (this.state.loading) return null
    if (this.state.authSetupNeeded) {
      return <AuthSetupView />
    } else {
      return <AuthUnlockView />
    }
  }
}
