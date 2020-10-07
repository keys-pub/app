import emoji from 'node-emoji'

import {rand} from './rpc/keys'
import {Key, KeyType, Encoding, RandRequest, RandResponse, SortDirection} from './rpc/keys.d'

import * as Long from 'long'

export const keyTypeLabel = (key: Key): string => {
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
  timeZoneName: undefined, // 'short',
}

export const date = (ms?: any): Date | null => {
  // ms can be a number or Long
  if (!ms) return null
  const l = ms.low != undefined ? Long.fromBits(ms.low, ms.high, ms.unsigned) : ms
  const s = l.toString()
  const n = parseInt(s)
  if (n === 0) {
    return null
  }
  return new Date(n)
}

export const dateString = (ms?: any): string => {
  const d = date(ms)
  if (d == null) {
    return ''
  }
  // return d.toJSON()
  return d.toLocaleDateString('en-US', dateOptions)
}

export const generateID = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    rand({numBytes: 32, encoding: Encoding.BASE62})
      .then((resp: RandResponse) => {
        resolve(resp.data)
      })
      .catch((err: Error) => reject(err))
  })
}

export const directionString = (d?: SortDirection): 'asc' | 'desc' => {
  switch (d) {
    case 'ASC':
      return 'asc'
    case 'DESC':
      return 'desc'
  }
  return 'asc'
}

export const pluralize = (n: number, s: string, p: string): string => {
  const out = n == 1 ? s : p
  return n + ' ' + out
}

export const flipDirection = (d: SortDirection): SortDirection => {
  switch (d) {
    case SortDirection.ASC:
      return SortDirection.DESC
    case SortDirection.DESC:
      return SortDirection.ASC
  }
}

export const deepCopy = (o: any) => {
  return JSON.parse(JSON.stringify(o))
}

export const toHex = (b: Uint8Array): string => {
  if (!b) return ''
  return Buffer.from(b).toString('hex')
}

export const fromHex = (s: string): Uint8Array => {
  return Uint8Array.from(Buffer.from(s, 'hex'))
}
