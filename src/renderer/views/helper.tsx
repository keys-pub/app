import emoji from 'node-emoji'

import {rand} from '../rpc/rpc'
import {Key, KeyType, Encoding, RPCError, RandRequest, RandResponse} from '../rpc/types'

export const keyDescription = (key: Key): string => {
  switch (key.type) {
    case KeyType.X25519:
      return 'Curve25519 Private Key'
    case KeyType.X25519_PUBLIC:
      return 'Curve25519 Public Key'
    case KeyType.EDX25519:
      return 'EdX25519 Private Key'
    case KeyType.EDX25519_PUBLIC:
      return 'EdX25519 Public Key'
    default:
      return ''
  }
}

var dateOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

export const dateString = (ms: string): string => {
  const n = parseInt(ms)
  if (n === 0) {
    return ''
  }
  const d = new Date(n)
  //return d.toJSON()

  return d.toLocaleDateString('en-US', dateOptions)
}

export const generateID = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    rand({length: 32, encoding: Encoding.BASE62}, (err: RPCError, resp: RandResponse) => {
      if (err) {
        reject(err)
        return
      }
      resolve(resp.data)
    })
  })
}
