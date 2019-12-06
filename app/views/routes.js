// @flow
import React from 'react'
import {Switch, Route} from 'react-router'

import {Box, Typography} from '@material-ui/core'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {Splash} from './components'

import AuthView from './auth'
import AuthIntroView from './auth/intro'
import AuthUnlockView from './auth/unlock'

import ProfileView from './profile'
import DebugView from './profile/debug'

import ComposeView from './compose'

// import KeyCreateView  from './key/create'
// import KeyBackupView  from './key/backup'
// import KeyRecoverView  from './key/recover'
// import KeyRemoveView  from './key/remove'

// import InboxView  from './inbox'
// import InboxInfoView  from './inbox/info'
// import InboxLeaveView  from './inbox/leave'

import SearchView from './search'
import StyleGuide from './style-guide'

import DBView from './db'
import KeyView from './key'
import KeysView from './keys'
import UserIntroView from './profile/user/intro'
import UserNameView from './profile/user/name'
import UserSignView from './profile/user/sign'

// TODO: Make path string RoutePath type
export type RouteInfo = {
  path: string,
  hideNav?: boolean,
  component: () => any,
  onLocationChange?: (dispatch: (action: any) => void) => void,
}

export const routes: Array<RouteInfo> = [
  {path: '/auth/index', component: () => <AuthView />},
  {path: '/auth/intro', component: () => <AuthIntroView />},
  {path: '/auth/unlock', component: () => <AuthUnlockView />},
  {path: '/compose', component: () => <ComposeView />},
  {path: '/db', component: () => <DBView />},
  {path: '/debug', component: () => <DebugView />},
  {path: '/key', component: () => <KeyView />},
  // {path: '/key/backup', component: props => <KeyBackup />},
  // {path: '/key/create', component: props => <KeyCreate />},
  // {path: '/key/recover', component: props => <KeyRecover />},
  // {path: '/key/remove', component: props => <KeyRemove />},
  // {path: '/inbox', nav: true, component: props => <Inbox />},
  // {path: '/inbox/info', component: props => <InboxInfo />},
  // {path: '/inbox/leave', component: props => <InboxLeave />},
  {
    path: '/keys',
    component: () => <KeysView />,
    // onLocationChange: (dispatch: (action: any) => void) => {},
  },
  {path: '/search', component: () => <SearchView />},
  {path: '/splash', component: () => <Splash />},
  {path: '/style-guide', component: () => <StyleGuide />},

  {path: '/profile/index', component: () => <ProfileView />},
  {path: '/profile/user/intro', component: () => <UserIntroView />},
  {path: '/profile/user/name', component: () => <UserNameView />},
  {path: '/profile/user/sign', component: () => <UserSignView />},
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
