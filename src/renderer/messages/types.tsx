import {Message} from '../rpc/keys.d'

export type MessageRow = {
  message: Message
  selected?: boolean
  pending?: boolean
}
