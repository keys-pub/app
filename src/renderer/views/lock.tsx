import * as React from 'react'

import {AppState} from '../reducers/app'

import {Routes, routesMap} from './routes'

import {Splash} from '../components'

import Auth from './auth'
import AppHeader from './header'
import Nav from './nav'

import {connect} from 'react-redux'

import {Box} from '@material-ui/core'
import ErrorsView from '../errors'

type Props = {
  error: Error | void
  path: string
  query: string
  unlocked: boolean
  updating: boolean
}

class Lock extends React.Component<Props> {
  renderApp() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="row" style={{height: '100%'}}>
        <Box display="flex" flexGrow={0} flexShrink={0}>
          <Nav />
        </Box>
        <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
          <AppHeader />
          <Routes />
        </Box>
      </Box>
    )
  }

  render() {
    if (this.props.error) {
      return <ErrorsView error={this.props.error} />
    }

    if (this.props.path == '/') {
      return null
    }

    console.log('Path:', this.props.path + this.props.query)
    const route = routesMap.get(this.props.path)
    if (!route) {
      const error = new Error('Route not found: ' + this.props.path)
      return <ErrorsView error={error} />
    }

    if (this.props.updating) {
      console.log('Updating...')
      return <Splash delay={0} />
    }

    console.log('Unlocked:', this.props.unlocked)

    if (!this.props.unlocked || this.props.path == '/' || this.props.path.startsWith('/auth')) {
      return <Auth />
    }

    return this.renderApp()
  }
}

const mapStateToProps = (state: {app: AppState; router: any}, ownProps: any) => {
  return {
    error: state.app.error,
    path: state.router.location.pathname,
    query: state.router.location.search,
    unlocked: state.app.unlocked,
    updating: state.app.updating,
  }
}

export default connect(mapStateToProps)(Lock)
