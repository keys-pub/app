import {Store} from 'pullstate'

import {keys as listKeys, runtimeStatus, configGet} from '../../rpc/keys'
import {Key, KeysRequest, SortDirection} from '../../rpc/keys.d'

type State = {
  createOpen: boolean
  exportOpen: boolean
  exportKey?: Key
  importOpen: boolean
  input: string
  intro: boolean
  keyOpen: boolean
  keyShow?: Key
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
  intro: true,
  keyOpen: false,
  keys: [],
  searchOpen: false,
  selected: '',
  syncEnabled: false,
  syncing: false,
}

export const store = new Store(initialState)

const list = async (query: string, intro: boolean, sortField?: string, sortDirection?: SortDirection) => {
  const req: KeysRequest = {
    query: query,
    sortField: sortField,
    sortDirection: sortDirection,
    types: [],
  }
  const resp = await listKeys(req)
  const keys = resp.keys || []
  store.update((s) => {
    s.keys = keys
    s.sortField = resp.sortField
    s.sortDirection = resp.sortDirection
  })
  // If we don't have keys and intro, then show create dialog
  if (keys.length == 0 && intro) {
    store.update((s) => {
      s.createOpen = true
      s.intro = false
    })
  }
}

export const loadStore = async () => {
  const resp = await runtimeStatus({})
  store.update((s) => {
    s.syncEnabled = !!resp.sync

    list(s.input, s.intro, s.sortField, s.sortDirection)
  })
}
