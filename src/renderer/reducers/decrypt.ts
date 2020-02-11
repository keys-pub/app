import {Key} from '../rpc/types'

export type DecryptState = {
  value: string
  file: string
  fileOut: string
  fileSigner: Key | void
}

const initialState: DecryptState = {
  value: '',
  file: '',
  fileOut: '',
  fileSigner: null,
}

type actionType = {
  type: string
  payload: any
}

export default function reducer(state: DecryptState = initialState, action: actionType): DecryptState {
  switch (action.type) {
    case 'DECRYPT_VALUE':
      return {
        ...state,
        value: action.payload.value,
      }
    case 'DECRYPT_FILE':
      return {
        ...state,
        file: action.payload.file,
      }
    case 'DECRYPT_FILE_OUT':
      return {
        ...state,
        fileOut: action.payload.fileOut,
        fileSigner: action.payload.fileSigner,
      }
    case 'DECRYPT_CLEAR':
      return {
        ...state,
        value: '',
        file: '',
        fileOut: '',
        fileSigner: null,
      }
    default:
      return state
  }
}
