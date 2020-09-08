import * as React from 'react'
import {Switch, Route} from 'wouter'

import {Box} from '@material-ui/core'
import DebugView from './settings/debug'

import SecretsView from './secrets'

import WormholeView from './wormhole'

import StyleGuide from './style-guide'
import SettingsView from './settings'

import DBView from './db'
import KeysView from './keys'
import VaultView from './vault'
import ToolsView from './tools'
import AuthenticatorsView from './authenticators'

export type RouteInfo = {
  path: string
  component: () => React.ReactNode
}

export const routes: Array<RouteInfo> = [
  {path: '/db/service', component: () => <DBView db="service" />},
  {path: '/db/vault', component: () => <DBView db="vault" />},
  {path: '/db/cfg', component: () => <DBView db="cfg" />},

  {path: '/debug', component: () => <DebugView />},

  {path: '/keys/index', component: () => <KeysView />},
  {path: '/secrets/index', component: () => <SecretsView />},

  {path: '/wormhole/index', component: () => <WormholeView />},
  {path: '/tools/index', component: () => <ToolsView />},

  {path: '/vault/index', component: () => <VaultView />},

  {path: '/authenticators/index', component: () => <AuthenticatorsView />},

  {path: '/style-guide', component: () => <StyleGuide />},

  {path: '/settings/index', component: () => <SettingsView />},
]

// Map of path to route
export const routesMap: Map<string, RouteInfo> = new Map(routes.map((r: RouteInfo) => [r.path, r]))

type Props = {}

export const Routes = (_: Props) => {
  return (
    <Switch>
      {routes.map((r: RouteInfo) => (
        <Route path={r.path} key={r.path || 'default'}>
          <Box display="flex" flex={1} id={r.path}>
            {r.component()}
          </Box>
        </Route>
      ))}
    </Switch>
  )
}
