export enum WormholeMessageType {
  Sent = 1,
  Received = 2,
  Status = 3,
}

export type WormholeMessage = {
  id: string
  text: string
  severity?: string // "info", "error", "success"
  type: WormholeMessageType
  pending?: boolean
  link?: string
}
