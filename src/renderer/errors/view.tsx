import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Typography} from '@material-ui/core'
import {styles} from '../components'

type Props = {
  error: Error | void
  errorInfo?: any
}

export default (props: Props) => {
  return (
    <Typography
      style={{
        ...styles.mono,
        ...styles.breakWords,
        overflowY: 'scroll',
        width: 'calc(100% - 30px)',
        backgroundColor: 'black',
        color: 'white',
        paddingLeft: 20,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 10,
      }}
    >
      {props.error && props.error.message}
      {props.errorInfo && props.errorInfo.componentStack}
    </Typography>
  )
}
