import {Store} from 'pullstate'

export interface Error {
  message: string
  details?: string
  code?: number
  name?: string
}

export type State = {
  error?: Error
  intro: boolean
  ready: boolean
  selectedTool: string
  unlocked: boolean
  updating: boolean
}

export const store = new Store<State>({
  intro: true,
  ready: false,
  selectedTool: 'encrypt',
  unlocked: false,
  updating: false,
})
