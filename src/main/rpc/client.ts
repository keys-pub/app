import * as getenv from 'getenv'
import * as grpc from '@grpc/grpc-js'
// import * as protoLoader from '@grpc/proto-loader'
// @ln-zap/proto-loader works in electron, see https://github.com/grpc/grpc-node/issues/969
import * as protoLoader from '@ln-zap/proto-loader'

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {app} from 'electron'
import {appResourcesPath, appSupportPath} from '../paths'

let keysClient: any = null
let fido2Client: any = null
let authToken: string = ''

const creds = (): any => {
  const certPath = path.join(appSupportPath(), 'ca.pem')
  console.log('Loading cert', certPath)
  const cert = fs.readFileSync(certPath, 'ascii')
  const callCreds = grpc.credentials.createFromMetadataGenerator(auth)
  const sslCreds = grpc.credentials.createSsl(Buffer.from(cert, 'ascii'))
  const creds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds)
  return creds
}

const resolveProtoPath = (name: string): string => {
  // Check in resources, otherwise use current path
  const protoInResources = path.join(appResourcesPath(), 'src', 'main', 'rpc', name)
  if (fs.existsSync(protoInResources)) return protoInResources
  return './src/main/rpc/' + name
}

const auth = (serviceUrl, callback) => {
  const metadata = new grpc.Metadata()
  metadata.set('authorization', authToken)
  callback(null, metadata)
}

export const setAuthToken = (t: string) => {
  authToken = t
}

// TODO: Type for grpc.ServiceClient
export const newClient = (protoName: string, packageName: string, serviceName: string): any => {
  console.log('New client:', protoName)

  const protoPath = resolveProtoPath(protoName)
  console.log('Proto path:', protoPath)
  // TODO: Show error if proto path doesn't exist
  const packageDefinition = protoLoader.loadSync(protoPath, {arrays: true, enums: String, defaults: true})
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
  if (!protoDescriptor[packageName]) {
    throw new Error('proto descriptor should have package ' + packageName)
  }
  const serviceCls = protoDescriptor[packageName][serviceName]
  if (typeof serviceCls !== 'function') {
    throw new Error('proto descriptor missing service ' + serviceName)
  }

  const port = getenv.int('KEYS_PORT', 22405)
  console.log('Using client on port', port)

  const cl = new serviceCls('localhost:' + port, creds())

  return cl
}

export const keys = async () => {
  if (!keysClient) {
    keysClient = newClient('keys.proto', 'service', 'Keys')
  }
  return keysClient
}

export const fido2 = async () => {
  if (!fido2Client) {
    fido2Client = newClient('fido2.proto', 'fido2', 'Authenticators')
  }
  return fido2Client
}

export const client = (service: string) => {
  switch (service) {
    case 'Keys':
      return keys()
    case 'Authenticators':
      return fido2()
    default:
      throw new Error('unknown service ' + service)
  }
}
