import * as React from 'react'

import AuthSetupView from './setup'
import AuthUnlockView from './unlock'
import AuthSplash from './splash'

import {keys} from '../rpc/client'
import {RuntimeStatusRequest, RuntimeStatusResponse, AuthStatus} from '@keys-pub/tsclient/lib/keys'
import {errored} from '../store'

export default (props: {}) => {
  const [status, setStatus] = React.useState(AuthStatus.AUTH_UNKNOWN)

  const refresh = async () => {
    try {
      const resp = await keys.RuntimeStatus({})
      setStatus(resp.authStatus!)
    } catch (err) {
      errored(err)
    }
  }

  React.useEffect(() => {
    refresh()
  }, [])

  console.log('Auth status:', status)
  if (status == AuthStatus.AUTH_UNKNOWN) {
    return <AuthSplash />
  }

  if (status == AuthStatus.AUTH_SETUP_NEEDED) {
    return <AuthSetupView refresh={refresh} />
  } else {
    return <AuthUnlockView />
  }
}
