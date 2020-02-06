import * as getenv from 'getenv'

import * as grpc from '@grpc/grpc-js'
// import * as protoLoader from '@grpc/proto-loader'
// @ln-zap/proto-loader works in electron, see https://github.com/grpc/grpc-node/issues/969
import * as protoLoader from '@ln-zap/proto-loader'

import * as fs from 'fs'

import {RPCError} from './rpc'

type RPC = {
  client: any
}

let rpc: RPC = {
  client: null,
}

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const initializeClient = async (certPath: string, authToken: string, protoPath: string) => {
  if (rpc.client) {
    console.log('Closing client...')
    grpc.closeClient(rpc.client)
    rpc.client = null
  }
  console.log('Initializing client')

  let waitCount = 0
  while (!fs.existsSync(certPath)) {
    if (waitCount % 4 == 0) {
      console.log('Waiting for cert path', certPath)
    }
    await sleep(250)
    if (waitCount++ > 30) {
      break
    }
  }

  console.log('Loading cert', certPath)
  const cert = fs.readFileSync(certPath, 'ascii')

  const auth = (serviceUrl, callback) => {
    const metadata = new grpc.Metadata()
    metadata.set('authorization', authToken)
    callback(null, metadata)
  }
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

  const port = getenv.int('KEYS_PORT', 10001)
  console.log('Using client on port', port)

  const cl = new serviceCls('localhost:' + port, creds)

  let ok = false
  while (!ok) {
    ok = await runtimeStatus(cl)
    if (!ok) {
      console.log('Waiting for service...')
      await sleep(1000)
    }
  }

  rpc.client = cl
}

const runtimeStatus = (cl: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cl.runtimeStatus({}, (err: RPCError | void) => {
      if (err) {
        if (err.code == grpc.status.UNAVAILABLE) {
          resolve(false)
          return
        }
        reject(err)
        return
      }
      resolve(true)
    })
  })
}

export const client = async () => {
  let waitCount = 0
  while (!rpc.client) {
    if (waitCount % 4 == 0) {
      console.log('Waiting for client init...')
    }
    await sleep(250)
    if (waitCount++ > 30) {
      break
    }
  }
  if (!rpc.client) {
    throw new Error('No client available')
  }
  return rpc.client
}
