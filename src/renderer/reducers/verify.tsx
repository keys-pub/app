import {Key} from '../rpc/types'

export type VerifyState = {
  value: string
  file: string
  fileOut: string
  fileSigner: Key | void
}

const initialState: VerifyState = {
  value: '',
  file: '',
  fileOut: '',
  fileSigner: null,
}

type actionType = {
  type: string
  payload: any
}

export default function reducer(state: VerifyState = initialState, action: actionType): VerifyState {
  switch (action.type) {
    case 'VERIFY_VALUE':
      return {
        ...state,
        value: action.payload.value,
      }
    case 'VERIFY_FILE':
      return {
        ...state,
        file: action.payload.file,
      }
    case 'VERIFY_FILE_OUT':
      return {
        ...state,
        fileOut: action.payload.fileOut,
        fileSigner: action.payload.fileSigner,
      }
    case 'VERIFY_CLEAR':
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
