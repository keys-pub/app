import {Key} from '../rpc/types'

export type EncryptState = {
  recipients: Key[]
  signer: string
  value: string
  file: string
  fileOut: string
}

const initialState: EncryptState = {
  recipients: [],
  signer: '',
  value: '',
  file: '',
  fileOut: '',
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
    case 'ENCRYPT_FILE':
      return {
        ...state,
        file: action.payload.file,
      }
    case 'ENCRYPT_FILE_OUT':
      return {
        ...state,
        fileOut: action.payload.fileOut,
      }
    case 'ENCRYPT_CLEAR':
      return {
        ...state,
        recipients: [],
        signer: '',
        value: '',
        file: '',
        fileOut: '',
      }

    default:
      return state
  }
}
