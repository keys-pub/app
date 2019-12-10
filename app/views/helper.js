// @flow
import emoji from 'node-emoji'

import type {Key, KeyType, User} from '../rpc/types'

export const serviceName = (service: string): string => {
  let serviceName = '?'
  switch (service) {
    case 'github':
      serviceName = 'Github'
      break
    case 'twitter':
      serviceName = 'Twitter'
      break
  }
  return serviceName
}

export const keyTypeString = (type: KeyType): string => {
  const s = keyTypeSymbol(type)
  switch (type || '') {
    case 'PUBLIC_KEY_TYPE':
      return s + ' Public Key'
    case 'PRIVATE_KEY_TYPE':
      return s + 'Private Key'
    default:
      return ''
  }
}

export const keyTypeSymbol = (type: KeyType): string => {
  switch (type) {
    case 'PRIVATE_KEY_TYPE':
      return emoji.get('key')
    case 'PUBLIC_KEY_TYPE':
      return emoji.get('lower_left_fountain_pen')
  }
  return emoji.get('question')
}

var dateOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

export const dateString = (ms: number): string => {
  const n = parseInt(ms)
  if (n === 0) {
    return ''
  }
  const d = new Date(n)
  //return d.toJSON()

  return d.toLocaleDateString('en-US', dateOptions)
}
