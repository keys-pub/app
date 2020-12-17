import {Store} from 'pullstate'

import {keys} from '../rpc/client'
import {Key, KeysRequest, SortDirection} from '@keys-pub/tsclient/lib/keys'
import {openSnack, openSnackError} from '../snack'

type State = {
  createOpen: boolean
  exportOpen: boolean
  exportKey?: Key
  importOpen: boolean
  input: string
  intro: boolean
  keyOpen: boolean
  keyShow?: Key
  removeOpen?: boolean
  removeKey?: Key
  results: Key[]
  searchOpen: boolean
  selected?: Key
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
  results: [],
  searchOpen: false,
  syncEnabled: false,
  syncing: false,
}

export const store = new Store(initialState)

const list = async (query: string, intro: boolean, sortField?: string, sortDirection?: SortDirection) => {
  try {
    const req: KeysRequest = {
      query: query,
      sortField: sortField,
      sortDirection: sortDirection,
      types: [],
    }
    const resp = await keys.keys(req)
    const results = resp.keys || []
    store.update((s) => {
      s.results = results
      s.sortField = resp.sortField
      s.sortDirection = resp.sortDirection
    })
    // If we don't have keys and intro, then show create dialog
    if (results.length == 0 && intro) {
      store.update((s) => {
        s.createOpen = true
        s.intro = false
      })
    }
  } catch (err) {
    openSnackError(err)
  }
}

export const loadStore = async () => {
  const resp = await keys.runtimeStatus({})
  store.update((s) => {
    s.syncEnabled = !!resp.sync

    list(s.input, s.intro, s.sortField, s.sortDirection)
  })
}
