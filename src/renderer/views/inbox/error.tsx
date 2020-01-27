import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

import {Inbox} from '../../rpc/types'
import {RPCError, RPCState} from '../../rpc/rpc'

export default (err: Error, inbox: Inbox) => {
  return (
    <Box
      display="flex"
      flex={1}
      flexDirection="column"
      style={{
        backgroundColor: 'white',
        paddingTop: 40,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <Box style={{alignSelf: 'center'}}>
        <Typography variant="subtitle1">Oops there was an error trying to load the inbox.</Typography>
        {inbox && (
          <Typography paragraph style={{}}>
            Inbox KID: {inbox.kid}
          </Typography>
        )}
        <Typography style={{color: '#993333'}}>{err.message}</Typography>
      </Box>
    </Box>
  )
}
