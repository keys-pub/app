import {
  Auth,
  credentials,
  createKeysClient,
  createFIDO2Client,
  KeysService,
  FIDO2Service,
} from '@keys-pub/tsclient'

import * as getenv from 'getenv'
import * as path from 'path'

const appDir = getenv.string('KEYS_APPDIR')
const port = getenv.int('KEYS_PORT')

const certPath = path.join(appDir, 'ca.pem')
export const auth: Auth = new Auth()
export const keys: KeysService = createKeysClient('localhost:' + port, credentials(certPath, auth))
export const fido2: FIDO2Service = createFIDO2Client('localhost:' + port, credentials(certPath, auth))
