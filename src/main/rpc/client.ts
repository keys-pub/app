import * as getenv from 'getenv'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

import * as fs from 'fs'
import * as path from 'path'
import {appResource, appSupportPath} from '../paths'
import {getPort} from '../env'

let keysClient: any = null
let fido2Client: any = null
let authToken: string = ''

const creds = (): any => {
  const certPath = path.join(appSupportPath(), 'ca.pem')
  console.log('Loading cert', certPath)
  const cert = fs.readFileSync(certPath, 'ascii')
  // console.log('Using cert:', cert)
  const callCreds = grpc.credentials.createFromMetadataGenerator(auth)
  const sslCreds = grpc.credentials.createSsl(Buffer.from(cert, 'ascii'))
  const creds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds)
  return creds
}

type CallMetadataOptions = {service_url: string}

const auth = (options: CallMetadataOptions, cb: (err: Error | null, metadata?: grpc.Metadata) => void) => {
  const metadata = new grpc.Metadata()
  metadata.set('authorization', authToken)
  cb(null, metadata)
}

export const setAuthToken = (t: string) => {
  authToken = t
}

// TODO: Type for grpc.ServiceClient
export const newClient = (protoName: string, packageName: string, serviceName: string): any => {
  console.log('New client:', protoName)

  const protoPath = appResource(path.join('src', 'main', 'rpc', protoName))
  console.log('Proto path:', protoPath)
  // TODO: Show error if proto path doesn't exist
  const packageDefinition = protoLoader.loadSync(protoPath, {arrays: true, enums: String, defaults: true})
  const protoDescriptor: any = grpc.loadPackageDefinition(packageDefinition)
  if (!protoDescriptor[packageName]) {
    throw new Error('proto descriptor should have package ' + packageName)
  }
  const serviceCls = protoDescriptor[packageName][serviceName]
  if (typeof serviceCls !== 'function') {
    throw new Error('proto descriptor missing service ' + serviceName)
  }

  const port = getPort()
  console.log('Using client on port', port)
  const cl = new serviceCls('localhost:' + port, creds())
  return cl
}

export const close = () => {
  console.log('Close rpc...')
  if (keysClient) {
    keysClient.close()
    keysClient = null
  }
  if (fido2Client) {
    fido2Client.close()
    fido2Client = null
  }
}

export const keys = () => {
  if (!keysClient) {
    keysClient = newClient('keys.proto', 'service', 'Keys')
  }
  return keysClient
}

export const fido2 = () => {
  if (!fido2Client) {
    fido2Client = newClient('fido2.proto', 'fido2', 'Auth')
  }
  return fido2Client
}

export const client = (service: string): any => {
  switch (service) {
    case 'Keys':
      return keys()
    case 'Auth':
      return fido2()
    default:
      throw new Error('unknown service ' + service)
  }
}
