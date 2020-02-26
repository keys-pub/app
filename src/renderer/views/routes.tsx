import * as React from 'react'
import {Switch, Route} from 'react-router'

import {Splash} from '../components'

import AuthView from './auth'

import DebugView from './settings/debug'

import ComposeView from './compose'

// import KeyCreateView from './key/create'
// import KeyExportView from './export'
// import KeyImportView from './import'
// import KeyRemoveView from './key/remove'

// import InboxView  from './inbox'
// import InboxInfoView  from './inbox/info'
// import InboxLeaveView  from './inbox/leave'

import SearchView from './search'
import StyleGuide from './style-guide'
import SettingsView from './settings'

import DBView from './db'
import KeyView from './key'
import KeysView from './keys'

import EncryptView from './encrypt'
import DecryptView from './decrypt'
import SignView from './sign'
import VerifyView from './verify'

// TODO: Make path string RoutePath type
export type RouteInfo = {
  path: string
  component: () => any
}

export const routes: Array<RouteInfo> = [
  {path: '/auth/index', component: () => <AuthView />},
  {path: '/db', component: () => <DBView />},
  {path: '/debug', component: () => <DebugView />},
  {path: '/keys/key/index', component: () => <KeyView />},
  // {path: '/keys/key/create', component: () => <KeyCreateView />},
  // {path: '/keys/key/export', component: () => <KeyExportView />},
  // {path: '/keys/key/import', component: () => <KeyImportView />},
  // {path: '/keys/key/remove', component: () => <KeyRemoveView />},
  {path: '/keys/index', component: () => <KeysView />},

  {path: '/search/index', component: () => <SearchView />},

  {path: '/splash', component: () => <Splash />},
  {path: '/style-guide', component: () => <StyleGuide />},

  {path: '/encrypt/index', component: () => <EncryptView />},
  {path: '/decrypt/index', component: () => <DecryptView />},
  {path: '/sign/index', component: () => <SignView />},
  {path: '/verify/index', component: () => <VerifyView />},

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
