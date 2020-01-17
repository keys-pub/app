import * as React from 'react'
import {Switch, Route} from 'react-router'

import {Splash} from './components'

import AuthView from './auth'
import AuthIntroView from './auth/intro'
import AuthUnlockView from './auth/unlock'

import DebugView from './profile/debug'

import ComposeView from './compose'

// import KeyCreateView  from './key/create'
import KeyExportView from './key/export'
import KeyImportView from './key/import'
// import KeyRemoveView  from './key/remove'

// import InboxView  from './inbox'
// import InboxInfoView  from './inbox/info'
// import InboxLeaveView  from './inbox/leave'

import SearchView from './search'
import StyleGuide from './style-guide'

import DBView from './db'
import KeyView from './key/view'
import KeysView from './keys'
import UserNameView from './user/name'
import UserSignView from './user/sign'

import EncryptView from './encrypt'

// TODO: Make path string RoutePath type
export type RouteInfo = {
  path: string
  hideNav?: boolean
  component: () => any
  onLocationChange?: (dispatch: (action: any) => void) => void
}

export const routes: Array<RouteInfo> = [
  {path: '/auth/index', component: () => <AuthView />},
  {path: '/auth/intro', component: () => <AuthIntroView />},
  {path: '/auth/unlock', component: () => <AuthUnlockView />},
  {path: '/compose', component: () => <ComposeView />},
  {path: '/db', component: () => <DBView />},
  {path: '/debug', component: () => <DebugView />},
  {path: '/key/index', component: () => <KeyView />},
  {path: '/key/export', component: () => <KeyExportView />},
  // {path: '/key/create', component: () => <KeyCreate />},
  {path: '/key/import', component: () => <KeyImportView />},
  // {path: '/key/remove', component: () => <KeyRemove />},
  // {path: '/inbox', nav: true, component: () => <Inbox />},
  // {path: '/inbox/info', component: () => <InboxInfo />},
  // {path: '/inbox/leave', component: () => <InboxLeave />},
  {
    path: '/keys/index',
    component: () => <KeysView />,
    // onLocationChange: (dispatch: (action: any) => void) => {},
  },
  {path: '/search/index', component: () => <SearchView />},
  {path: '/splash', component: () => <Splash />},
  {path: '/style-guide', component: () => <StyleGuide />},

  {path: '/user/name', component: () => <UserNameView />},
  {path: '/user/sign', component: () => <UserSignView />},

  {path: '/encrypt/index', component: () => <EncryptView />},
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
