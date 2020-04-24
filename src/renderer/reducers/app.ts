import {WatchStatus} from '../rpc/keys.d'

export type AppState = {
  appFocused: boolean
  error: Error | void
  intro: boolean
  navMinimize: boolean
  selectedInbox: string
  unlocked: boolean
  updating: boolean
  watchStatus: WatchStatus
}

const initialState: AppState = {
  appFocused: false,
  error: null,
  intro: true,
  navMinimize: false,
  selectedInbox: '',
  unlocked: null,
  updating: false,
  watchStatus: WatchStatus.WATCH_UKNOWN,
}

type actionType = {
  type: string
  payload: any
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
    case 'NAV_MINIMIZE':
      return {
        ...state,
        navMinimize: action.payload.navMinimize,
      }
    case 'UPDATING':
      return {
        ...state,
        updating: true,
      }
    case 'INTRO':
      return {
        ...state,
        intro: action.payload,
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
