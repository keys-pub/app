import * as React from 'react'

import AuthSetupView from './setup'
import AuthUnlockView from './unlock'
import AuthSplash from './splash'

import {runtimeStatus} from '../../rpc/keys'
import {RuntimeStatusRequest, RuntimeStatusResponse, AuthStatus} from '../../rpc/keys.d'
import {store, Error} from '../store'

export default (props: {}) => {
  const [status, setStatus] = React.useState(AuthStatus.AUTH_UNKNOWN)

  const refresh = async () => {
    try {
      const resp = await runtimeStatus({})
      setStatus(resp.authStatus!)
    } catch (err) {
      store.update((s) => {
        s.error = err as Error
      })
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
    return <AuthUnlockView refresh={refresh} />
  }
}
