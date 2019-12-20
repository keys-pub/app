// @flow
import React, {Component} from 'react'

import {Box, Divider, LinearProgress, Typography} from '@material-ui/core'
import {Lock} from '@material-ui/icons'

type Props = {
  loading: boolean,
}

export default (props: Props) => {
  return (
    <Box display="flex" flexDirection="column" style={{paddingBottom: 20, paddingTop: 40, width: '100%'}}>
      <Box display="flex" flexDirection="row" style={{alignSelf: 'center'}}>
        <Typography style={{fontSize: 48, fontWeight: 800, color: '#2196f3'}}>keys</Typography>
        {/*<Typography style={{fontSize: 48, fontWeight: 800, color: 'white'}}>.</Typography>
         */}
        <Typography style={{fontSize: 48, fontWeight: 800, color: '#666666'}}>.pub</Typography>
      </Box>
      {!props.loading && <Divider style={{marginBottom: 3}} />}
      {props.loading && <LinearProgress />}
    </Box>
  )
}
