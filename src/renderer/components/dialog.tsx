import * as React from 'react'

import {
  Box,
  Button,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import {Close as CloseIcon} from '@material-ui/icons'

import {PropTypes} from '@material-ui/core'

type DialogTitleProps = {
  loading?: boolean
  children: React.ReactNode
  onClose?: () => void
}

const DialogTitle = (props: DialogTitleProps) => {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexGrow={1} flexDirection="row">
        <Box className="drag">
          <Typography
            style={{paddingBottom: 3, paddingLeft: 20, paddingTop: 10, fontSize: 20, fontWeight: 500}}
          >
            {props.children}
          </Typography>
        </Box>
        <Box display="flex" flex={1} flexGrow={1} flexDirection="row" className="drag" />
        {props.onClose && (
          <Box style={{marginTop: 12, marginRight: 10}}>
            <IconButton size="small" aria-label="close" color="inherit" onClick={props.onClose}>
              <CloseIcon fontSize="small" style={{color: '#999999'}} />
            </IconButton>
          </Box>
        )}
      </Box>
      {!props.loading && <Box style={{marginBottom: 4}} />}
      {props.loading && <LinearProgress />}
    </Box>
  )
}

export type DialogAction = {
  label: string
  action: () => void
  color?: PropTypes.Color
}

type Props = {
  title?: string
  open: boolean
  loading?: boolean
  children?: React.ReactNode
  close?: DialogAction
  actions?: DialogAction[]
  disabled?: boolean
}

const Dialog = (props: Props) => {
  return (
    <MuiDialog
      open={props.open}
      onClose={() => (props.close ? props.close.action() : {})}
      fullWidth
      maxWidth="sm"
      disableBackdropClick
      // keepMounted
    >
      {props.title && (
        <DialogTitle loading={props.loading} onClose={props.close?.action}>
          {props.title}
        </DialogTitle>
      )}
      <DialogContent dividers>{props.children}</DialogContent>
      <DialogActions>
        {props.close && (
          <Button onClick={props.close.action} color={props.close.color} key="close">
            {props.close.label}
          </Button>
        )}
        {props.actions?.map((action: DialogAction) => (
          <Button onClick={action.action} color={action.color} key={action.label} disabled={props.disabled}>
            {action.label}
          </Button>
        ))}
      </DialogActions>
    </MuiDialog>
  )
}

export {DialogTitle}
export default Dialog
