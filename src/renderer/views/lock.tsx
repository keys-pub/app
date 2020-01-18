import * as React from 'react'

// import {RouteInfo} from './routes'
import {AppState} from '../reducers/app'

import {ipcRenderer} from 'electron'

import {Routes, routesMap} from './routes'
import {goBack, push} from 'connected-react-router'

import Auth from './auth'
import AppHeader from './header'
import Nav from './nav'

import * as queryString from 'query-string'
import {connect} from 'react-redux'

import {Box} from '@material-ui/core'
import ErrorsView from './errors'

type Props = {
  error: Error | void
  unlocked?: boolean
  path: string
  dispatch: (action: any) => any
}

class Lock extends React.Component<Props> {
  restart = () => {
    this.props.dispatch(push('/auth/index'))
    ipcRenderer.send('restart-app', {})
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  clearError = () => {
    this.props.dispatch({
      type: 'CLEAR_ERROR',
    })
  }

  renderApp() {
    const route = routesMap.get(this.props.path)
    const hideNav = !route || route.hideNav || this.props.path === '/'

    return (
      <Box display="flex" flexGrow={1} flexDirection="row" style={{height: '100%'}}>
        {!hideNav && (
          <Box display="flex" flexGrow={0} flexShrink={0}>
            <Nav />
          </Box>
        )}
        <Box display="flex" flexGrow={1} flexDirection="column">
          {!hideNav && <AppHeader goBack={this.back} />}
          <Routes />
        </Box>
      </Box>
    )
  }

  render() {
    if (this.props.error) {
      return <ErrorsView error={this.props.error} restart={this.restart} clearError={this.clearError} />
    }

    console.log('Unlocked:', this.props.unlocked)

    if (!this.props.unlocked || this.props.path == '/') {
      return <Auth />
    }

    if (this.props.unlocked) {
      return this.renderApp()
    }
  }
}

const mapStateToProps = (state: {app: AppState; router: any}, ownProps: any) => {
  const values = queryString.parse(state.router.location.search)
  return {
    error: state.app.error,
    unlocked: state.app.unlocked,
    path: state.router.location.pathname,
  }
}

export default connect(mapStateToProps)(Lock)
