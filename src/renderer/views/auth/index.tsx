import * as React from 'react'

import AuthSetupView from './setup'
import AuthUnlockView from './unlock'
import AuthSplash from './splash'

import {runtimeStatus} from '../../rpc/keys'
import {RuntimeStatusRequest, RuntimeStatusResponse, AuthStatus} from '../../rpc/keys.d'

export default (props: {}) => {
  const [status, setStatus] = React.useState(AuthStatus.AUTH_UNKNOWN)

  const refresh = async () => {
    const req: RuntimeStatusRequest = {}
    const resp = await runtimeStatus(req)
    setStatus(resp.authStatus!)
  }

  React.useEffect(() => {
    refresh()
  }, [])

  console.log('Auth status:', status)
  if (status == AuthStatus.AUTH_UNKNOWN) {
    return <AuthSplash />
  }

  if (status == AuthStatus.AUTH_SETUP) {
    return <AuthSetupView refresh={refresh} />
  } else {
    return <AuthUnlockView />
  }
}
