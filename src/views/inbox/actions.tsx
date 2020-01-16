import {List} from 'immutable'

import {Inbox} from '../../rpc/types'
import {RPCState} from '../../rpc/rpc'
import {InboxRow} from './types'

export const selectedInbox = (rpc: RPCState, kid: string): Inbox | void => {
  const inboxes = rpc.inbox && rpc.inbox.inboxes ? rpc.inbox.inboxes : []
  const selected: Inbox | void = inboxes.find((v: Inbox) => kid && v.kid === kid)
  return selected
}

export const inboxRows = (rpc: RPCState, kid: string): Array<InboxRow> => {
  const inboxes = rpc.inbox && rpc.inbox.inboxes ? rpc.inbox.inboxes : []
  const rows: Array<InboxRow> = inboxes.map(
    (v: Inbox): InboxRow => {
      const selected = kid ? v.kid === kid : false
      return {inbox: v, selected}
    }
  )

  return rows
}
