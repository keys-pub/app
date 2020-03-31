import {Key} from '../rpc/types'

export enum WormholeMessageType {
  Sent = 1,
  Received = 2,
  Status = 3,
}

export type WormholeMessage = {
  id: string
  text: string
  severity?: string // "info", "error", "success"
  type: WormholeMessageType
  pending?: boolean
  link?: string
}

export type WormholeState = {
  sender: string
  recipient: string
  messages: WormholeMessage[]
}

const initialState: WormholeState = {
  sender: '',
  recipient: '',
  messages: [],
}

type actionType = {
  type: string
  payload: any
}

export default function reducer(state: WormholeState = initialState, action: actionType): WormholeState {
  switch (action.type) {
    case 'WORMHOLE_RECIPIENT':
      return {
        ...state,
        recipient: action.payload.recipient,
      }
    case 'WORMHOLE_SENDER':
      return {
        ...state,
        sender: action.payload.sender,
      }
    case 'WORMHOLE_MESSAGES':
      return {
        ...state,
        messages: action.payload.messages,
      }

    default:
      return state
  }
}
