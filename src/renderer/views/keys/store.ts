import {Store} from 'pullstate'

import {Key, SortDirection} from '../../rpc/keys.d'

type State = {
  createOpen: boolean
  exportOpen: boolean
  exportKey?: Key
  importOpen: boolean
  input: string
  intro: boolean
  keyOpen: boolean
  keys: Key[]
  removeOpen?: boolean
  removeKey?: Key
  searchOpen: boolean
  selected: string
  sortField?: string
  sortDirection?: SortDirection
  syncEnabled: boolean
  syncing: boolean
}

const initialState: State = {
  createOpen: false,
  exportOpen: false,
  importOpen: false,
  input: '',
  intro: false,
  keyOpen: false,
  keys: [],
  searchOpen: false,
  selected: '',
  syncEnabled: false,
  syncing: false,
}

export const store = new Store(initialState)
