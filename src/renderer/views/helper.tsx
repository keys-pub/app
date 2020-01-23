import emoji from 'node-emoji'

import {Key, KeyType} from '../rpc/types'

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

export const keyDescription = (key: Key): string => {
  switch (key.type) {
    case KeyType.CURVE25519:
      if (key.isPrivate) {
        return 'Curve25519 Private Key'
      }
      return 'Curve25519 Public Key'
    case KeyType.ED25519:
      if (key.isPrivate) {
        return 'Ed25519 Private Key'
      }
      return 'Ed25519 Public Key'
    default:
      return 'Unknown (' + key.type + ')'
  }
}

export const keySymbol = (key: Key): string => {
  switch (key.type) {
    case KeyType.CURVE25519:
      return emoji.get('key')
    case KeyType.ED25519:
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

export const dateString = (ms: string): string => {
  const n = parseInt(ms)
  if (n === 0) {
    return ''
  }
  const d = new Date(n)
  //return d.toJSON()

  return d.toLocaleDateString('en-US', dateOptions)
}
