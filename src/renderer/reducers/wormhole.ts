import {Key} from '../rpc/types'

export type WormholeState = {
  sender: string
  recipient: string
}

const initialState: WormholeState = {
  sender: '',
  recipient: '',
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

    default:
      return state
  }
}
