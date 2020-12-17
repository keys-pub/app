import {
  certPath,
  Credentials,
  keysService,
  fido2Service,
  KeysService,
  FIDO2Service,
  RPCError,
} from '@keys-pub/tsclient'

import * as getenv from 'getenv'

import {lock, errored} from '../store'
import {ConsoleLogger} from './logger'

const port = getenv.int('KEYS_PORT', 22405)

export const creds: Credentials = new Credentials(certPath())

export const keys = keysService('localhost:' + port, creds)
keys.log = new ConsoleLogger()
keys.on('unauthenticated', (e: RPCError) => {
  lock()
})
keys.on('unavailable', (e: RPCError) => {
  errored(e)
})

export const fido2: FIDO2Service = fido2Service('localhost:' + port, creds)
fido2.on('unauthenticated', (e: RPCError) => {
  lock()
})
fido2.on('unavailable', (e: RPCError) => {
  errored(e)
})
