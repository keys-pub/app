// @flow
import React, {Component} from 'react'

import {Box, Divider, LinearProgress, Typography} from '@material-ui/core'
import {Lock} from '@material-ui/icons'

type Props = {
  loading: boolean,
}

export default (props: Props) => {
  return (
    <Box display="flex" flexDirection="column" style={{paddingBottom: 20, marginTop: 30, width: '100%'}}>
      <Typography style={{fontSize: 48, fontWeight: 600, alignSelf: 'center'}}>keys.pub</Typography>
      {!props.loading && <Divider style={{marginBottom: 3}} />}
      {props.loading && <LinearProgress />}
    </Box>
  )
}
