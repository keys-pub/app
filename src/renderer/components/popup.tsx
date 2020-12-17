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
import {CloseIcon} from '../icons'

type Props = {
  open: boolean
  children?: React.ReactNode
  close?: () => void
}

const Popup = (props: Props) => {
  return (
    <MuiDialog open={props.open} onClose={props.close}>
      <DialogContent style={{position: 'relative'}}>
        <Box style={{position: 'absolute', top: 6, right: 6}}>
          <IconButton size="small" aria-label="close" color="inherit" onClick={props.close}>
            <CloseIcon fontSize="small" style={{color: '#999999'}} />
          </IconButton>
        </Box>
        {props.children}
      </DialogContent>
    </MuiDialog>
  )
}

export default Popup
