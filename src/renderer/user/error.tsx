import * as React from 'react'

import {Box, Button, DialogContentText, Divider, LinearProgress, Typography} from '@material-ui/core'
import Dialog from '../components/dialog'
import Snack, {SnackProps} from '../components/snack'
import {status} from '@grpc/grpc-js'
import {Error} from '../store'

type Props = {
  open: boolean
  error?: Error
  close: () => void
}

export default (props: Props) => {
  switch (props.error?.code) {
    case status.ALREADY_EXISTS:
      return <ErrorConflict {...props} />
    default:
      return <ErrorSnack {...props} />
  }
}

const ErrorSnack = (props: Props) => {
  const snack = {message: props.error?.message, alert: 'error', duration: 8000}
  return <Snack open={props.open} {...snack} onClose={() => props.close()} />
}

// const ErrorDefault = (props: Props) => {
//   return (
//     <Dialog
//       open={props.open}
//       close={{label: 'Close', action: () => props.close(false)}}
//       title="Error"
//     >
//       <Typography>Oops, there was an error.</Typography>
//       <Typography>{props.error?.message}</Typography>
//     </Dialog>
//   )
// }

const ErrorConflict = (props: Props) => {
  return (
    <Dialog
      open={props.open}
      close={{label: 'Close', action: () => props.close()}}
      title="Previous Key Exists"
    >
      <Typography paragraph>You have a previous key published with this user.</Typography>
      <Typography paragraph>
        <em>If you still have access to the key</em>, you should revoke the user linked to this key.
      </Typography>
      <Typography paragraph>
        <em>If you don't have access to the key</em>, you can find and remove the signed statement that you
        previously saved.
      </Typography>
      <Typography paragraph>
        <em>If you have already removed the signed statement</em>, there might be a delay of a few minutes
        before the server realizes the statement is gone.
      </Typography>
    </Dialog>
  )
}
