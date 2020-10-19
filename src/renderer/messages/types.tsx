import {Message} from '@keys-pub/tsclient/lib/keys.d'

export type MessageRow = {
  message: Message
  selected?: boolean
  pending?: boolean
}
