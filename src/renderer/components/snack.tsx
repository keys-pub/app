import * as React from 'react'

import {Box, IconButton, Snackbar, SnackbarContent, Typography} from '@material-ui/core'

import {Close as CloseIcon} from '@material-ui/icons'

import Alert, {Color as AlertColor} from '@material-ui/lab/Alert'

type Props = {
  open: boolean
  message: string
  onClose: () => void
  alert?: string
  duration?: number
}

export type SnackOpts = {
  message: string
  alert?: string
  duration?: number
}

export const Snack = (props: Props) => {
  if (!!props.alert) {
    return <SnackAlert {...props} />
  }

  return (
    <Snackbar
      // anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      open={props.open}
      onClose={props.onClose}
      autoHideDuration={props.duration}
    >
      <SnackbarContent
        message={props.message}
        style={{fontSize: '0.857rem'}}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={props.onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </Snackbar>
  )
}

const SnackAlert = (props: Props) => {
  return (
    <Snackbar open={props.open} onClose={props.onClose} autoHideDuration={props.duration}>
      <Alert
        severity={props.alert as AlertColor}
        elevation={3}
        // variant="filled"
        style={{paddingTop: 5, paddingBottom: 3}}
      >
        <Box display="flex" flexDirection="row" alignItems="flex-start">
          <Typography style={{paddingRight: 10, minWidth: 200, paddingTop: 1}}>{props.message}</Typography>
          <IconButton size="small" aria-label="close" color="inherit" onClick={props.onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Alert>
    </Snackbar>
  )
}
