// @flow

import type {Key, WatchStatus} from '../rpc/types'
import type {RPCState, RPCError} from '../rpc/rpc'

export type {RPCState, RPCError}

export type AppState = {
  appFocused: boolean,
  error: ?Error,
  promptPublish: boolean,
  promptUser: boolean,
  selectedInbox: string,
  unlocked: ?boolean,
  watchStatus: WatchStatus,
}

const initialState: AppState = {
  appFocused: false,
  error: null,
  promptPublish: true,
  promptUser: true,
  selectedInbox: '',
  unlocked: null,
  watchStatus: 'NO_STATUS',
}

type actionType = {
  type: string,
  payload: any,
}

export default function reducer(state: AppState = initialState, action: actionType): AppState {
  switch (action.type) {
    case 'ERROR':
      return {
        ...state,
        error: action.payload.error,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'WATCH_STATUS':
      return {
        ...state,
        watchStatus: action.payload.status,
      }
    case '@@router/LOCATION_CHANGE':
      if (action.payload.location.pathname !== '/inbox') {
        return {
          ...state,
          selectedInbox: '',
        }
      }
      return state
    case 'APP_FOCUSED':
      return {
        ...state,
        appFocused: action.payload.focused,
      }
    case 'UNLOCK':
      return {
        ...state,
        unlocked: true,
      }
    case 'LOCK':
      return {
        ...state,
        unlocked: false,
      }
    case 'PROMPT_PUBLISH':
      return {
        ...state,
        promptPublish: action.payload,
      }
    case 'PROMPT_USER':
      return {
        ...state,
        promptUser: action.payload,
      }
    case 'SELECT_INBOX':
      return {
        ...state,
        selectedInbox: action.payload.selectedInbox,
      }

    default:
      return state
  }
}
