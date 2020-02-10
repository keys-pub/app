import {Key} from '../rpc/types'

export type SignState = {
  signer: string
  value: string
}

const initialState: SignState = {
  signer: '',
  value: '',
}

type actionType = {
  type: string
  payload: any
}

export default function reducer(state: SignState = initialState, action: actionType): SignState {
  switch (action.type) {
    case 'SIGN_SIGNER':
      return {
        ...state,
        signer: action.payload.signer,
      }
    case 'SIGN_VALUE':
      return {
        ...state,
        value: action.payload.value,
      }
    case 'SIGN_CLEAR':
      return {
        ...state,
        signer: '',
        value: '',
      }

    default:
      return state
  }
}
