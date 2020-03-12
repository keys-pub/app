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

let rpcClient: any = null
let authToken: string = ''

const loadCertPath = (): string => {
  return path.join(appSupportPath(), 'ca.pem')
}

const resolveProtoPath = (): string => {
  // Check in resources, otherwise use current path
  const protoInResources = path.join(appResourcesPath(), 'src', 'main', 'rpc', 'keys.proto')
  if (fs.existsSync(protoInResources)) return protoInResources
  return './src/main/rpc/keys.proto'
}

const auth = (serviceUrl, callback) => {
  const metadata = new grpc.Metadata()
  metadata.set('authorization', authToken)
  callback(null, metadata)
}

export const setAuthToken = (t: string) => {
  authToken = t
}

export const initializeClient = () => {
  if (rpcClient != null) {
    console.error('RPC client already initialized')
    return
  }
  console.log('Initializing client')

  const certPath = loadCertPath()
  const protoPath = resolveProtoPath()
  console.log('Using proto path:', protoPath)

  console.log('Loading cert', certPath)
  const cert = fs.readFileSync(certPath, 'ascii')

  const callCreds = grpc.credentials.createFromMetadataGenerator(auth)
  const sslCreds = grpc.credentials.createSsl(Buffer.from(cert, 'ascii'))
  const creds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds)

  console.log('Proto path:', protoPath)
  // TODO: Show error if proto path doesn't exist
  const packageDefinition = protoLoader.loadSync(protoPath, {arrays: true, enums: String, defaults: true})
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
  if (!protoDescriptor.service) {
    throw new Error('proto descriptor should have service package')
  }
  const serviceCls = protoDescriptor.service['Keys']
  if (!serviceCls) {
    throw new Error('proto descriptor should have a Keys service')
  }

  const port = getenv.int('KEYS_PORT', 22405)
  console.log('Using client on port', port)

  const cl = new serviceCls('localhost:' + port, creds)

  rpcClient = cl
}

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const client = async () => {
  let waitCount = 0
  while (!rpcClient) {
    if (waitCount % 4 == 0) {
      console.log('Waiting for client init...')
    }
    await sleep(250)
    if (waitCount++ > 1000) {
      break
    }
  }
  if (!rpcClient) {
    throw new Error('No client available (timed out)')
  }
  return rpcClient
}
