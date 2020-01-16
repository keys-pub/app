import * as React from 'react'
import {Provider} from 'react-redux'
import {ConnectedRouter, goBack, push} from 'connected-react-router'
import {Routes, routesMap} from './routes'

import Auth from './auth'
import AppHeader from './header'
import App from './app'
import Nav from './nav'

import Errors from './errors'
import ErrorBoundary from './errors/boundary'

import * as queryString from 'query-string'
import * as electron from 'electron'

import {ThemeProvider} from '@material-ui/styles'
import {Box, Dialog, DialogContent, Typography} from '@material-ui/core'
import {createMuiTheme} from '@material-ui/core/styles'
import {fade} from '@material-ui/core/styles/colorManipulator'

import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import {RouteInfo} from './routes'

import {AppState} from '../reducers/app'

const theme = createMuiTheme({
  typography: {
    // fontFamily: 'Roboto',
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  overrides: {
    MuiInput: {
      root: {
        // fontFamily: 'Roboto Mono',
      },
      underline: {
        '&:after': {
          borderBottomColor: `#2196f3`,
          borderBottomWidth: 1,
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottomColor: `black`,
          borderBottomWidth: 1,
        },
      },
    },
    MuiButton: {
      root: {
        fontFamily: 'Roboto',
        fontSize: 14,
      },
      sizeSmall: {
        fontSize: 12,
      },
      sizeLarge: {
        fontSize: 16,
      },
      outlinedPrimary: {
        backgroundColor: fade('#2196f3', 0.05),
      },
    },
  },
})

type Props = {
  store: any
  history: any
  error?: Error
  unlocked?: boolean
  path: string
  popup: string
  dispatch: (action: any) => any
}

class Root extends React.Component<Props> {
  unlisten: any

  clearError = () => {
    this.props.dispatch({
      type: 'CLEAR_ERROR',
    })
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      // console.log('Listen:', location, action)
      const route: RouteInfo | void = routesMap.get(location.pathname)
      if (route && route.onLocationChange) {
        route.onLocationChange(this.props.dispatch)
      }
    })
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten()
      this.unlisten = null
    }
  }

  restart = () => {
    this.props.dispatch(push('/auth/index'))
    electron.ipcRenderer.send('restart-app', {})
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  renderApp() {
    const route = routesMap.get(this.props.path)
    const hideNav = !route || route.hideNav || this.props.path === '/'

    return (
      <App>
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
      </App>
    )
  }

  render() {
    console.log('Unlocked:', this.props.unlocked)
    return (
      <ThemeProvider theme={theme}>
        <Errors error={this.props.error} restart={this.restart} clearError={this.clearError}>
          <ErrorBoundary>
            <Provider store={this.props.store}>
              <ConnectedRouter history={this.props.history}>
                {(!this.props.unlocked || this.props.path == '/') && <Auth />}
                {this.props.unlocked && this.renderApp()}
              </ConnectedRouter>
            </Provider>
          </ErrorBoundary>
        </Errors>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = (state: {app: AppState; router: any}, ownProps: any) => {
  const values = queryString.parse(state.router.location.search)
  return {
    error: state.app.error,
    unlocked: state.app.unlocked,
    path: state.router.location.pathname,
    popup: (values.popup || '').toString(),
  }
}

// $FlowFixMe
export default connect(mapStateToProps)(Root)
