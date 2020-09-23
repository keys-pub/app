import * as React from 'react'

import {Box} from '@material-ui/core'

import SecretsView from './secrets'

import WormholeView from './wormhole'

import SettingsView from './settings'

import KeysView from './keys'
import ToolsView from './tools'

import {store} from './store'

export type RouteInfo = {
  location: string
  component: () => React.ReactNode
}

export const routes: Array<RouteInfo> = [
  {location: '/keys', component: () => <KeysView />},
  {location: '/secrets', component: () => <SecretsView />},

  {location: '/wormhole', component: () => <WormholeView />},

  {location: '/tools', component: () => <ToolsView />},

  {location: '/settings', component: () => <SettingsView />},
]

type Props = {}

export default (_: Props) => {
  const location = store.useState((s) => s.location)
  let route = routes.find((r: RouteInfo) => {
    if (location.startsWith(r.location)) {
      return r
    }
  })
  if (!route) route = routes[0]
  return (
    <Box display="flex" flex={1} id={route?.location}>
      {route?.component()}
    </Box>
  )
}
