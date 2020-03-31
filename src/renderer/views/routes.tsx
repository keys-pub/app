import * as React from 'react'
import {Switch, Route} from 'react-router'

import {Splash} from '../components'

import AuthView from './auth'

import DebugView from './settings/debug'

// import KeyCreateView from './key/create'
// import KeyExportView from './export'
// import KeyImportView from './import'
// import KeyRemoveView from './key/remove'

import SearchView from './search'
import WormholeView from './wormhole'

import StyleGuide from './style-guide'
import SettingsView from './settings'

import DBView from './db'
import KeyView from './key'
import KeysView from './keys'
import ToolsView from './tools'

// TODO: Make path string RoutePath type
export type RouteInfo = {
  path: string
  component: () => any
}

export const routes: Array<RouteInfo> = [
  {path: '/auth/index', component: () => <AuthView />},
  {path: '/db', component: () => <DBView />},
  {path: '/debug', component: () => <DebugView />},

  {path: '/keys/index', component: () => <KeysView />},

  {path: '/search/index', component: () => <SearchView />},
  {path: '/wormhole/index', component: () => <WormholeView />},
  {path: '/tools/index', component: () => <ToolsView />},

  {path: '/splash', component: () => <Splash delay={0} />},
  {path: '/style-guide', component: () => <StyleGuide />},

  {path: '/settings/index', component: () => <SettingsView />},
]

// Map of path to route
export const routesMap: Map<string, RouteInfo> = new Map(routes.map((r: RouteInfo) => [r.path, r]))

type Props = {}

export const Routes = (_: Props) => {
  const routeComponents = routes.map((r: RouteInfo) => {
    return (
      <Route path={r.path} key={r.path}>
        {r.component()}
      </Route>
    )
  })
  return <Switch>{routeComponents}</Switch>
}
