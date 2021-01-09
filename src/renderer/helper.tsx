import emoji from 'node-emoji'

import {rpc} from './rpc/client'
import {EDX25519, X25519} from './rpc/keys'
import dayjs from 'dayjs'
import {Key, Encoding, RandRequest, RandResponse, SortDirection} from '@keys-pub/tsclient/lib/rpc'

import * as Long from 'long'

export const keyTypeLabel = (key: Key): string => {
  switch (key.type) {
    case X25519:
      if (key.isPrivate) {
        return 'Curve25519 Private Key'
      }
      return 'Curve25519 Public Key'
    case EDX25519:
      if (key.isPrivate) {
        return 'EdX25519 Private Key'
      }
      return 'EdX25519 Public Key'
    default:
      return 'Unknown'
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

export const date = (ms?: any): Date | undefined => {
  // ms can be a number or Long
  if (!ms) return undefined
  const l = ms.low != undefined ? Long.fromBits(ms.low, ms.high, ms.unsigned) : ms
  const s = l.toString()
  const n = parseInt(s)
  if (n === 0) {
    return undefined
  }
  return new Date(n)
}

export const dateString = (ms?: any): string => {
  const d = date(ms)
  if (!d) {
    return ''
  }
  // return d.toJSON()
  return d.toLocaleDateString('en-US', dateOptions)
}

export const timeString = (ms?: any): string => {
  const d = date(ms)
  if (!d) {
    return ''
  }
  // return d.toJSON()
  //return d.toLocaleDateString('en-US', dateOptions)
  return dayjs(d).format('h:mma')
}

export const generateID = async (): Promise<string> => {
  const resp = await rpc.rand({numBytes: 32, encoding: Encoding.BASE62})
  return resp.data || ''
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
