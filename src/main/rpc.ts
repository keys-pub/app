import {ipcMain} from 'electron'

import {RPCError} from './rpc/service.keys'
import {client, setAuthToken} from './rpc/client'

type RPC = {
  method: string
  args: any
  reply: string
  end: boolean
}

type RPCReply = {
  err: RPCError
  resp: any
}

type RPCStreamReply = {
  resp?: any
  err?: RPCError
  done?: boolean
}

const convertErr = (err: any): RPCError => {
  if (!err) return null
  // Need to convert err to an object type.
  // TODO: what if source err is not RPCError?
  return {
    code: err.code,
    message: err.message,
    details: err.details,
  }
}

const rpc = (cl, f): Promise<RPCReply> => {
  return new Promise((resolve, reject) => {
    cl[f.method](f.args, (err: any, resp: any) => {
      resolve({err: convertErr(err), resp: resp})
    })
  })
}

let streams: Map<string, any> = new Map()

export const rpcRegister = () => {
  ipcMain.on('rpc', async (event, arg) => {
    const f = arg as RPC
    const cl = await client()
    console.log('rpc', f.reply)
    const out: RPCReply = await rpc(cl, f)
    if (out.err) {
      console.error('rpc err', f.reply, out.err)
    } else {
      console.log('rpc reply', f.reply)
    }
    event.reply(f.reply, out)
  })

  ipcMain.on('authToken', (event, arg) => {
    setAuthToken(arg.authToken)
  })

  ipcMain.on('rpc-stream', async (event, arg) => {
    const f = arg as RPC
    const cl = await client()
    console.log('rpc-stream', f.reply)

    const stream = streams.get(f.reply)
    if (!!stream) {
      console.log('found stream', f.reply)
      if (f.args) {
        console.log('stream write', f.reply)
        stream.write(f.args)
      }
      if (f.end) {
        console.log('stream end', f.reply)
        stream.end()
        streams.delete(f.reply)
      }
      return
    }

    console.log('new stream', f.reply)
    const newStream = cl[f.method]()

    streams.set(f.reply, newStream)

    newStream.on('data', (resp) => {
      console.log('rpc-stream data', f.reply)
      event.reply(f.reply, {resp: resp} as RPCStreamReply)
    })
    newStream.on('error', (err) => {
      console.log('rpc-stream err', f.reply, err)
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
