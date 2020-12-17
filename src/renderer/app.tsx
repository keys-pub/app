import * as React from 'react'

import * as grpc from '@grpc/grpc-js'

import Routes from './routes'
import {store} from './store'

import Nav from './nav'

import {Box} from '@material-ui/core'

import {keys} from './rpc/client'
import {RPCError} from '@keys-pub/tsclient'
import {Config} from '@keys-pub/tsclient/lib/keys'
import {openSnackError} from './snack'

export default (_: {}) => {
  React.useEffect(() => {
    return store.createReaction(
      (s) => ({
        location: s.location,
        history: s.history,
        navMinimized: s.navMinimized,
      }),
      (s) => {
        const config: Config = {
          app: {
            location: s.location,
            history: s.history,
            navMinimized: s.navMinimized,
          },
        }
        const set = async () => await keys.configSet({name: 'app', config})
        set()
      }
    )
  }, [])

  return (
    <Box display="flex" flex={1} flexDirection="row" style={{height: '100%'}}>
      <Nav />
      <Routes />
    </Box>
  )
}
