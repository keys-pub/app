import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Typography} from '@material-ui/core'

type Props = {
  error: Error | void
  errorInfo?: any
}

export default (props: Props) => {
  return (
    <Typography
      style={{
        fontFamily: 'Roboto Mono',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        width: 'calc(100% - 40px)',
        height: '100%',
        backgroundColor: 'black',
        color: 'white',
        paddingLeft: 40,
        paddingTop: 20,
      }}
    >
      {props.error && props.error.message}
      {props.errorInfo && props.errorInfo.componentStack}
    </Typography>
  )
}
