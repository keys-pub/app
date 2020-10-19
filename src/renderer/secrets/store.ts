import {Store} from 'pullstate'

import {keys} from '../rpc/client'
import {Secret, SortDirection, SecretsRequest} from '@keys-pub/tsclient/lib/keys.d'

export type State = {
  editing?: Secret
  input: string
  isNew: boolean
  secrets: Secret[]
  selected?: Secret
  sortField?: string
  sortDirection?: SortDirection
  syncEnabled: boolean
  syncing: boolean
}

const initialState: State = {
  input: '',
  isNew: false,
  secrets: [],
  syncEnabled: false,
  syncing: false,
}

export const store = new Store(initialState)

const list = async (query: string, sortField?: string, sortDirection?: SortDirection) => {
  const req: SecretsRequest = {
    query: query,
    sortField: sortField,
    sortDirection: sortDirection,
  }
  const resp = await keys.Secrets(req)
  const secrets = resp.secrets || []
  store.update((s) => {
    if (!s.selected && secrets.length > 0) {
      s.selected = secrets[0]
    }
    s.secrets = secrets
    s.sortField = sortField
    s.sortDirection = resp.sortDirection
  })
}

export const loadStore = async () => {
  const resp = await keys.RuntimeStatus({})
  store.update((s) => {
    s.syncEnabled = !!resp.sync

    list(s.input, s.sortField, s.sortDirection)
  })
}
