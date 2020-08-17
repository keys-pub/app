import * as React from 'react'

import {ThemeProvider} from '@material-ui/styles'
import {createMuiTheme} from '@material-ui/core/styles'
import {fade} from '@material-ui/core/styles/colorManipulator'
import {backgroundSelectedColor} from '../components/styles'
import {Router} from 'wouter'

import {Routes, routesMap} from './routes'
import {useLocation} from 'wouter'
import {Store, Error} from '../store/pull'
import {ipcRenderer, remote} from 'electron'

import Auth from './auth'
import Nav from './nav'

import {Box, Typography} from '@material-ui/core'
import Errors from '../errors'
import UpdateAlert from './update/alert'
import UpdateSplash from './update/splash'

import {updateCheck} from './update'
import * as grpc from '@grpc/grpc-js'

import {setErrHandler, runtimeStatus} from '../rpc/keys'
import {RuntimeStatusRequest, RuntimeStatusResponse} from '../rpc/keys.d'

import './app.css'

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
          // borderBottomWidth: 1,
        },
        // '&:hover:not($disabled):not($focused):not($error):before': {
        //   borderBottomColor: `black`,
        //   borderBottomWidth: 1,
        // },
      },
    },
    MuiButton: {
      root: {
        // fontFamily: 'Roboto',
        fontSize: 14,
      },
      sizeSmall: {
        fontSize: 12,
      },
      sizeLarge: {
        fontSize: 16,
      },
      startIcon: {
        marginRight: 4,
      },
      outlinedPrimary: {
        'not($disabled)': {
          backgroundColor: fade('#2196f3', 0.05),
        },
      },
      outlinedSecondary: {
        'not($disabled)': {
          backgroundColor: fade('#f50057', 0.05),
        },
      },
    },
    MuiTableRow: {
      root: {
        '&$selected': {
          backgroundColor: backgroundSelectedColor(),
        },
      },
      hover: {
        '&:hover': {
          backgroundColor: '#fafafa !important',
        },
      },
    },
    MuiTabs: {
      root: {
        minHeight: 40,
      },
    },
    MuiTab: {
      root: {
        minHeight: 40,
      },
    },
    // MuiToggleButton: {
    //   root: {
    //     fontFamily: 'Roboto',
    //     fontSize: 14,
    //     backgroundColor: fade('#2196f3', 0.1),
    //   },
    //   sizeSmall: {
    //     fontSize: 12,
    //   },
    //   sizeLarge: {
    //     fontSize: 16,
    //   },
    // },
  },
})

// Returns the current hash location in a normalized form
// (excluding the leading '#' symbol).
const currentLocation = () => {
  return window.location.hash.replace(/^#/, '') || '/'
}

const useHashLocation = (to: any): any => {
  const [location, setLocation] = React.useState(currentLocation())

  React.useEffect(() => {
    const handler = () => setLocation(currentLocation())

    // Subscribe to hash changes
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  // Remember to wrap your function with `useCallback` hook
  const navigate = React.useCallback((to) => (window.location.hash = to), [])

  return [location, navigate]
}

// TODO: If service is disconnected, show disconnected UI...
// {code: 14, message: "14 UNAVAILABLE: No connection established", details: "No connection established"}

const App = (_: {}) => (
  <Box display="flex" flex={1} flexDirection="row" style={{height: '100%'}}>
    <Nav />
    <Routes />
  </Box>
)

const Root = (_: {}) => {
  const [location, setLocation] = useLocation()

  const {unlocked, updating} = Store.useState((s) => ({
    unlocked: s.unlocked,
    updating: s.updating,
  }))

  console.log('Location:', location)

  ipcRenderer.removeAllListeners('preferences')
  ipcRenderer.on('preferences', (event, message) => {
    setLocation('/settings/index')
  })

  if (!unlocked) {
    return <Auth />
  }

  if (updating) {
    return <UpdateSplash />
  }

  return <App />
}

export default (_: {}) => {
  return (
    <ThemeProvider theme={theme}>
      <Router hook={useHashLocation}>
        <Root />
        <Errors />
      </Router>
    </ThemeProvider>
  )
}

ipcRenderer.removeAllListeners('log')
ipcRenderer.on('log', function (event, text) {
  console.log('Main process:', text)
})

// Keys start
ipcRenderer.removeAllListeners('keys-started')
ipcRenderer.on('keys-started', (event, err) => {
  if (err) {
    alert('Oops, exec error: ' + err.toString())
    remote.app.exit(2)
  }

  setErrHandler((err: Error) => {
    switch (err.code) {
      case grpc.status.PERMISSION_DENIED:
      case grpc.status.UNAUTHENTICATED:
        Store.update((s) => {
          s.unlocked = false
        })
        break
      case grpc.status.UNAVAILABLE:
        Store.update((s) => {
          s.unlocked = false
          s.error = err
        })
        break
    }
  })

  // Update check
  updateCheck()
})
ipcRenderer.send('keys-start')

const online = () => {
  console.log('Online')
  ping()
}
window.addEventListener('online', online)
// window.addEventListener('offline', offlineFn)

ipcRenderer.removeAllListeners('focus')
ipcRenderer.on('focus', (event, message) => {
  ping()
})

// ipcRenderer.on('unresponsive', (event, message) => {})

// ipcRenderer.on('responsive', (event, message) => {})

const ping = () => {
  // console.log('Ping')
  // const req: RuntimeStatusRequest = {}
  // runtimeStatus(req)
  //   .then((resp: RuntimeStatusResponse) => {})
  //   .catch((err: Error) => {})
}
