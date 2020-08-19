import {Store} from 'pullstate'

export interface Error {
  message: string
  details?: string
  code?: number
  name?: string
}

export type State = {
  ready: boolean
  error?: Error
  selectedTool: string
  unlocked: boolean
  updating: boolean
}

export const store = new Store<State>({
  ready: false,
  selectedTool: 'encrypt',
  unlocked: false,
  updating: false,
})
