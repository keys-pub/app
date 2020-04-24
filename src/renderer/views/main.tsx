import * as React from 'react'

import {AppState} from '../reducers/app'

import {Routes, routesMap} from './routes'

import UpdateSplash from './update/splash'

import Auth from './auth'
import AuthSplash from './auth/splash'
import Nav from './nav'
import Header from './header'

import {connect} from 'react-redux'
import {store} from '../store'

import {Box} from '@material-ui/core'
import ErrorsView from '../errors'
import ErrorsDialog from '../errors/dialog'
import UpdateAlert from './update/alert'

type Props = {
  error: Error | void
  navMinimize: boolean
  path: string
  query: string
  unlocked: boolean
  updating: boolean
}

// TODO: If service is disconnected, show disconnected UI...
// {code: 14, message: "14 UNAVAILABLE: No connection established", details: "No connection established"}

class Main extends React.Component<Props> {
  app() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="row" style={{height: '100%'}}>
        <Box display="flex" flexGrow={0} flexShrink={0}>
          <Nav />
        </Box>
        <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
          <Routes />
        </Box>
      </Box>
    )
  }

  clearError = () => {
    store.dispatch({type: 'CLEAR_ERROR'})
  }

  cover() {
    if (this.props.path == '/') {
      return <AuthSplash />
    }

    console.log('Path:', this.props.path + this.props.query)
    const route = routesMap.get(this.props.path)
    if (!route) {
      const error = new Error('Route not found: ' + this.props.path)
      return <ErrorsView error={error} />
    }

    if (this.props.updating) {
      console.log('Updating...')
      return <UpdateSplash />
    }

    console.log('Unlocked:', this.props.unlocked)

    if (!this.props.unlocked || this.props.path.startsWith('/auth/')) {
      return <Auth />
    }

    return null
  }

  render() {
    let view = this.cover()
    let isCover = true

    if (!view) {
      view = this.app()
      isCover = false
    }

    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Header navMinimize={this.props.navMinimize} lock={!isCover} back={!isCover} />
        {view}
        <UpdateAlert />
        <ErrorsDialog error={this.props.error} clearError={this.clearError} />
      </Box>
    )
  }
}

const mapStateToProps = (state: {app: AppState; router: any}, ownProps: any) => {
  return {
    error: state.app.error,
    navMinimize: state.app.navMinimize,
    path: state.router.location.pathname,
    query: state.router.location.search,
    unlocked: state.app.unlocked,
    updating: state.app.updating,
  }
}

export default connect(mapStateToProps)(Main)
