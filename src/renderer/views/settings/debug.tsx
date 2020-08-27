import * as React from 'react'

import {Box, Button, Divider, Typography} from '@material-ui/core'
import {routes} from '../routes'
import {Link} from '../../components'

import {RouteInfo} from '../routes'
import {useLocation} from 'wouter'

type Props = {}

export default (props: Props) => {
  const [location, setLocation] = useLocation()
  return (
    <Box display="flex" flexDirection="column">
      <Divider />
      <Box paddingTop={2} paddingLeft={2}>
        <Box display="flex" flexDirection="column">
          <Typography>Routes</Typography>
          {routes.map((r: RouteInfo) => (
            <Box display="flex" flexDirection="row" key={r.path}>
              <Link onClick={() => setLocation(r.path)}>{r.path}</Link>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
