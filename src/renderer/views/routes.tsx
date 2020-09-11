import * as React from 'react'

import {Box} from '@material-ui/core'

import SecretsView from './secrets'

import WormholeView from './wormhole'

import StyleGuide from './style-guide'
import SettingsView from './settings'

import DBView from './db'
import KeysView from './keys'
import VaultView from './vault'
import ToolsView from './tools'
import AuthenticatorsView from './authenticators'

import {store} from './store'

export type RouteInfo = {
  location: string
  component: () => React.ReactNode
}

export const routes: Array<RouteInfo> = [
  {location: 'db/service', component: () => <DBView db="service" />},
  {location: 'db/vault', component: () => <DBView db="vault" />},

  {location: 'keys', component: () => <KeysView />},
  {location: 'secrets', component: () => <SecretsView />},

  {location: 'wormhole', component: () => <WormholeView />},

  {location: 'tools', component: () => <ToolsView />},

  {location: 'vault', component: () => <VaultView />},

  {location: 'authenticators', component: () => <AuthenticatorsView />},

  {location: 'style-guide', component: () => <StyleGuide />},

  {location: 'settings', component: () => <SettingsView />},
]

// Map of path to route
const routesMap: Map<string, RouteInfo> = new Map(routes.map((r: RouteInfo) => [r.location, r]))

type Props = {}

export default (_: Props) => {
  const {location} = store.useState((s) => ({
    location: s.location,
  }))
  const route = routesMap.get(location)
  return (
    <Box display="flex" flex={1} id={route?.location}>
      {route?.component()}
    </Box>
  )
}
