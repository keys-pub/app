import {Key} from '../rpc/types'

export type EncryptState = {
  recipients: Key[]
  signer: string
  value: string
}

const initialState: EncryptState = {
  recipients: [],
  signer: '',
  value: '',
}

type actionType = {
  type: string
  payload: any
}

export default function reducer(state: EncryptState = initialState, action: actionType): EncryptState {
  switch (action.type) {
    case 'ENCRYPT_RECIPIENTS':
      return {
        ...state,
        recipients: action.payload.recipients,
      }
    case 'ENCRYPT_SIGNER':
      return {
        ...state,
        signer: action.payload.signer,
      }
    case 'ENCRYPT_VALUE':
      return {
        ...state,
        value: action.payload.value,
      }
    case 'ENCRYPT_CLEAR':
      return {
        ...state,
        recipients: [],
        signer: '',
        value: '',
      }

    default:
      return state
  }
}
