import {Message} from '@keys-pub/tsclient/lib/keys'

export type MessageRow = {
  message: Message
  selected?: boolean
  pending?: boolean
}
