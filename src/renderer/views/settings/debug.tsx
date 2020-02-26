import * as React from 'react'

import {Box, Button, Divider, Typography} from '@material-ui/core'
import {push} from 'connected-react-router'
import {routes} from '../routes'
import {Link} from '../../components'
import {store} from '../../store'

import {RouteInfo} from '../routes'

type Props = {}

export default class Debug extends React.Component<Props> {
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
