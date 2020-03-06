import * as getenv from 'getenv'

import * as grpc from '@grpc/grpc-js'
// import * as protoLoader from '@grpc/proto-loader'
// @ln-zap/proto-loader works in electron, see https://github.com/grpc/grpc-node/issues/969
import * as protoLoader from '@ln-zap/proto-loader'

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {remote} from 'electron'

import {RPCError} from './rpc'

let rpcClient: any = null

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const getAppName = (): string => {
  return getenv.string('KEYS_APP', 'Keys')
}

const loadCertPath = (): string => {
  const appName: string = getAppName()

  let supportDir
  if (os.platform() == 'linux') {
    if (process.env.XDG_DATA_HOME) {
      supportDir = process.env.XDG_DATA_HOME
    } else {
      const homeDir = os.homedir()
      supportDir = path.join(homeDir, '.local', 'share')
    }
  } else {
    supportDir = remote.app.getPath('appData')
  }

  const appSupportDir = path.join(supportDir, appName)

  console.log('App support path:', appSupportDir)
  return appSupportDir + '/ca.pem'
}

// Path to resources directory
export const appResourcesPath = (): string => {
  if (os.platform() !== 'darwin') return '.'
  let resourcesPath = remote.app.getAppPath()
  if (path.extname(resourcesPath) === '.asar') {
    resourcesPath = path.dirname(resourcesPath)
  }
  console.log('Resources path:', resourcesPath)
  return resourcesPath
}

const resolveProtoPath = (): string => {
  // Check in Resources, otherwise use current path
  const protoInResources = appResourcesPath() + '/src/renderer/rpc/keys.proto'
  if (fs.existsSync(protoInResources)) return protoInResources
  return './src/renderer/rpc/keys.proto'
}

export const initializeClient = (authToken: string) => {
  if (rpcClient) {
    console.log('Closing client...')
    grpc.closeClient(rpcClient)
    rpcClient = null
  }
  console.log('Initializing client')

  const certPath = loadCertPath()
  const protoPath = resolveProtoPath()
  console.log('Using proto path:', protoPath)

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

  const port = getenv.int('KEYS_PORT', 22405)
  console.log('Using client on port', port)

  const cl = new serviceCls('localhost:' + port, creds)

  rpcClient = cl
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
