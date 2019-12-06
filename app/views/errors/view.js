// @flow
import React, {Component} from 'react'

import {Box} from '@material-ui/core'

import {Button, Typography} from '@material-ui/core'

type Props = {
  error: ?Error,
  errorInfo?: any,
}

export default (props: Props) => {
  return (
    <Box style={{width: '100%'}}>
      <Typography
        variant="h5"
        style={{paddingBottom: 10, fontFamily: 'Roboto Mono', textAlign: 'center'}}
        color="secondary"
      >
        Ah shucks! Something isn
        {"'"}t working right.
      </Typography>
      <Typography
        style={{
          fontFamily: 'Roboto Mono',
          marginBottom: 20,
          height: 400,
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          backgroundColor: 'black',
          color: 'white',
          paddingLeft: 40,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {props.error && props.error.message}
        {props.errorInfo && props.errorInfo.componentStack}
      </Typography>
    </Box>
  )
}
