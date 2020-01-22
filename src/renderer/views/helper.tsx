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
  const s = keySymbol(key)
  switch (key.type) {
    case KeyType.CURVE25519:
      return s + ' Curve25519'
    case KeyType.ED25519:
      return s + ' Ed25519'
    default:
      return s
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
