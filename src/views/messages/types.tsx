import {Message} from '../../rpc/types'

export type MessageRow = {
  message: Message
  selected?: boolean
  pending?: boolean
}
