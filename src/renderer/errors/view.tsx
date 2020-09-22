import * as React from 'react'

import {Box} from '@material-ui/core'
import {Error} from '../store'
import {breakWords} from '../theme'
import {Button, Typography} from '@material-ui/core'

type Props = {
  error: Error
  errorInfo?: any
}

export default (props: Props) => {
  return (
    <Typography
      variant="body2"
      style={{
        ...breakWords,
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
