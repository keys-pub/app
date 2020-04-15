import emoji from 'node-emoji'

import {rand} from '../rpc/rpc'
import {Key, KeyType, Encoding, RPCError, RandRequest, RandResponse, SortDirection} from '../rpc/types'

import * as Long from 'long'

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
  timeZoneName: 'short',
}

export const dateString = (ms): string => {
  if (!ms) return ''
  const s = new Long(ms.low, ms.high, ms.unsigned).toString()
  const n = parseInt(s)
  if (n === 0) {
    return ''
  }
  const d = new Date(n)
  // return d.toJSON()
  return d.toLocaleDateString('en-US', dateOptions)
}

export const generateID = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    rand({numBytes: 32, encoding: Encoding.BASE62}, (err: RPCError, resp: RandResponse) => {
      if (err) {
        reject(err)
        return
      }
      resolve(resp.data)
    })
  })
}

export const directionString = (d: SortDirection): 'asc' | 'desc' => {
  switch (d) {
    case 'ASC':
      return 'asc'
    case 'DESC':
      return 'desc'
  }
  return 'asc'
}

export const flipDirection = (d: SortDirection): SortDirection => {
  switch (d) {
    case SortDirection.ASC:
      return SortDirection.DESC
    case SortDirection.DESC:
      return SortDirection.ASC
  }
  return SortDirection.ASC
}

export const deepCopy = (o: any) => {
  return JSON.parse(JSON.stringify(o))
}
