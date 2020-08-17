import {ipcMain, BrowserWindow} from 'electron'

import {client, setAuthToken, close} from './rpc/client'
import {Error} from '@material-ui/icons'
import * as grpc from '@grpc/grpc-js'

type RPC = {
  service: string
  method: string
  args: any
  reply: string
  end: boolean
}

interface Error {
  code: number
  message: string
  name: string
}

type RPCReply = {
  err?: Error
  resp?: any
}

type RPCStreamReply = {
  resp?: any
  err?: Error
  done?: boolean
}

const rpc = (cl: any, f: RPC): Promise<RPCReply> => {
  return new Promise((resolve, reject) => {
    if (typeof cl[f.method] !== 'function') {
      console.log('rpc not found', f.reply)
      // console.log('methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(cl)))
      resolve({err: notFound(f.method)})
      return
    }
    cl[f.method](f.args, (err: Error, resp: any) => {
      resolve({err: convertErr(err), resp: resp})
    })
  })
}

let streams: Map<string, any> = new Map()

export const rpcRegister = () => {
  ipcMain.removeAllListeners('rpc')
  ipcMain.on('rpc', async (event, arg) => {
    const f = arg as RPC
    const cl = await client(f.service)
    console.log('rpc', f.reply)
    const out: RPCReply = await rpc(cl, f)
    if (out.err) {
      console.error('rpc err', f.reply, out.err)
      handleErr(out.err)
    } else {
      console.log('rpc reply', f.reply)
    }
    event.reply(f.reply, out)
  })

  ipcMain.removeAllListeners('authToken')
  ipcMain.on('authToken', (event, arg) => {
    setAuthToken(arg.authToken)
  })

  ipcMain.removeAllListeners('rpc-stream')
  ipcMain.on('rpc-stream', async (event, arg) => {
    const f = arg as RPC
    const cl = await client(arg.service)
    console.log('rpc-stream', f.reply)

    const stream = streams.get(f.reply)
    if (!!stream) {
      console.log('found rpc-stream', f.reply)
      if (f.args) {
        console.log('rpc-stream write', f.reply)
        stream.write(f.args)
      }
      if (f.end) {
        console.log('rpc-stream end', f.reply)
        stream.end()
        streams.delete(f.reply)
      }
      return
    }

    console.log('new stream', f.reply)
    if (typeof cl[f.method] !== 'function') {
      console.log('rpc-stream not found', f.reply)
      event.reply(f.reply, {err: notFound(f.method)} as RPCStreamReply)
      return
    }
    const newStream = cl[f.method]()

    streams.set(f.reply, newStream)

    newStream.on('data', (resp: any) => {
      console.log('rpc-stream data', f.reply)
      event.reply(f.reply, {resp: resp} as RPCStreamReply)
    })
    newStream.on('error', (err: Error) => {
      console.log('rpc-stream err', f.reply, err)
      handleErr(err)
      event.reply(f.reply, {err: convertErr(err)} as RPCStreamReply)
      streams.delete(f.reply)
    })
    newStream.on('end', () => {
      console.log('rpc-stream end', f.reply)
      event.reply(f.reply, {done: true} as RPCStreamReply)
      streams.delete(f.reply)
    })
    console.log('stream write', f.reply)
    newStream.write(f.args)
    if (f.end) {
      console.log('stream end', f.reply)
      newStream.end()
    }
  })
}

const notFound = (method: string): Error => {
  return {
    code: grpc.status.NOT_FOUND,
    message: method + ' not found',
    name: 'NotFoundError',
  }
}

export const handleErr = (err: Error) => {
  if (err.code == grpc.status.UNAVAILABLE) {
    // Close RPC (will re-open next call)
    close()
  }
}

const convertErr = (err: any): Error | undefined => {
  if (!err) return undefined
  // Need to convert err to an object type.
  return {
    code: err?.code || grpc.status.UNKNOWN,
    message: err?.details || err?.message || 'unknown error',
    name: err?.name || 'Error',
  }
}
