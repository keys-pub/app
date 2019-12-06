// @flow

// $FlowFixMe
import {List} from 'immutable'

import type {Inbox} from '../../rpc/types'
import type {RPCState} from '../../rpc/rpc'
import type {InboxRow} from './types'

export const selectedInbox = (rpc: RPCState, kid: ?string): ?Inbox => {
  const inboxes = rpc.inbox && rpc.inbox.inboxes ? rpc.inbox.inboxes : []
  const selected: ?Inbox = inboxes.find((v: Inbox) => kid && v.kid === kid)
  return selected
}

export const inboxRows = (rpc: RPCState, kid: ?string): List<InboxRow> => {
  const inboxes = rpc.inbox && rpc.inbox.inboxes ? rpc.inbox.inboxes : []
  const rows: List<InboxRow> = new List(
    inboxes.map((v: Inbox): InboxRow => {
      const selected = kid ? v.kid === kid : false
      return {inbox: v, selected}
    })
  )
  return rows
}
