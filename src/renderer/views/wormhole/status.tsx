import {WormholeMessage, WormholeMessageType} from '../../store'

export const welcomeStatus = () => {
  // TODO: Make messages are only available for the life of the connection (+1 minute?).
  return {
    id: 'welcome',
    severity: 'info',
    text:
      'A wormhole is an encrypted tunnel between 2 computers using the specified keys. For more details, see ',
    type: WormholeMessageType.Status,
    link: 'keys.pub/docs/specs/wormhole',
  }
}

export const canStartStatus = (): WormholeMessage => {
  return {
    id: 'can-start',
    severity: 'info',
    text: "You're ready to start the wormhole on this side. Now hit start!",
    type: WormholeMessageType.Status,
  }
}

export const connectingStatus = (recipient: string): WormholeMessage => {
  return {
    id: 'connecting',
    severity: 'info',
    text: 'We are trying to connect to ' + recipient + '. They need to start the wormhole on their side.',
    type: WormholeMessageType.Status,
  }
}

export const connectedStatus = (): WormholeMessage => {
  return {
    id: 'connected',
    severity: 'success',
    text: 'You are connected!',
    type: WormholeMessageType.Status,
  }
}

export const disconnectedStatus = (): WormholeMessage => {
  return {
    id: 'disconnected',
    severity: 'error',
    text: 'Disconnected.',
    type: WormholeMessageType.Status,
  }
}

export const errorStatus = (error: string): WormholeMessage => {
  return {
    id: 'error',
    severity: 'error',
    text: error,
    type: WormholeMessageType.Status,
  }
}
