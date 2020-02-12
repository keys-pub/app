import * as React from 'react'

import {Box, Button, Divider, Typography} from '@material-ui/core'

import {connect} from 'react-redux'

import {push, goBack} from 'connected-react-router'

import {routes} from '../routes'

import {styles, Link} from '../../components'

import {store} from '../../store'

import {RPCState} from '../../rpc/rpc'

import {RouteInfo} from '../routes'

type Props = {}

class Debug extends React.Component<Props> {
  push = (route: string) => {
    const r = route
    return () => {
      store.dispatch(push(r))
    }
  }

  renderRoutes() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography>Routes</Typography>
        {routes.map((r: RouteInfo) => (
          <Box display="flex" flexDirection="row" key={r.path}>
            <Link onClick={this.push(r.path)}>{r.path}</Link>
          </Box>
        ))}
      </Box>
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column">
        <Divider />
        <Box paddingTop={2} paddingLeft={2}>
          {this.renderRoutes()}
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any): any => {
  return {}
}

// $FlowFixMe
export default connect(mapStateToProps)(Debug)
