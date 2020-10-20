import {
  Auth,
  credentials,
  createKeysClient,
  createFIDO2Client,
  KeysService,
  FIDO2Service,
  certPath,
  RPCError,
} from '@keys-pub/tsclient'

import * as getenv from 'getenv'

import {lock, errored} from '../store'

const port = getenv.int('KEYS_PORT', 22405)

export const auth: Auth = new Auth()

export const keys: KeysService = createKeysClient('localhost:' + port, credentials(certPath(), auth))
keys.on('unauthenticated', (e: RPCError) => {
  lock()
})
keys.on('unavailable', (e: RPCError) => {
  errored(e)
})

export const fido2: FIDO2Service = createFIDO2Client('localhost:' + port, credentials(certPath(), auth))
fido2.on('unauthenticated', (e: RPCError) => {
  lock()
})
fido2.on('unavailable', (e: RPCError) => {
  errored(e)
})
