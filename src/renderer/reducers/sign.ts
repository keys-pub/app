import {Key} from '../rpc/service.keys.d'

export type SignState = {
  signer: string
  value: string
  file: string
  fileOut: string
}

const initialState: SignState = {
  signer: '',
  value: '',
  file: '',
  fileOut: '',
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
    case 'SIGN_FILE':
      return {
        ...state,
        file: action.payload.file,
      }
    case 'SIGN_FILE_OUT':
      return {
        ...state,
        fileOut: action.payload.fileOut,
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
