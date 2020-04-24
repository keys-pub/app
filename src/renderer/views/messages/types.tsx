import {Message} from '../../rpc/service.keys.d'

export type MessageRow = {
  message: Message
  selected?: boolean
  pending?: boolean
}
