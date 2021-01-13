import {
  certPath,
  Credentials,
  rpcService,
  fido2Service,
  RPCService,
  FIDO2Service,
  RPCError,
} from '@keys-pub/tsclient'

import * as getenv from 'getenv'

import {lock, errored} from '../store'
import {ConsoleLogger} from './logger'

const appName = getenv.string('KEYS_APP')
const port = getenv.int('KEYS_PORT')

export const creds: Credentials = new Credentials(certPath(appName))

export const rpc = rpcService('localhost:' + port, creds)
rpc.log = new ConsoleLogger()
rpc.on('unauthenticated', (e: RPCError) => {
  lock()
})
rpc.on('unavailable', (e: RPCError) => {
  errored(e)
})

export const fido2: FIDO2Service = fido2Service('localhost:' + port, creds)
fido2.on('unauthenticated', (e: RPCError) => {
  lock()
})
fido2.on('unavailable', (e: RPCError) => {
  errored(e)
})
