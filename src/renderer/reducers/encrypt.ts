import {Key} from '../rpc/types'

export type EncryptState = {
  recipients: string[]
  sender: string
  value: string
  file: string
  fileOut: string
}

const initialState: EncryptState = {
  recipients: [],
  sender: '',
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
    case 'ENCRYPT_SENDER':
      return {
        ...state,
        sender: action.payload.sender,
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
        sender: '',
        value: '',
        file: '',
        fileOut: '',
      }

    default:
      return state
  }
}
