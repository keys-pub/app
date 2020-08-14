import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles, DialogTitle} from '../components'

import {Store} from '../store/pull'

import {ipcRenderer} from 'electron'
import ErrorView from './view'

const restart = () => {
  ipcRenderer.send('reload-app', {})
}

export default (_: {}) => {
  const {error} = Store.useState((s) => ({
    error: s.error,
  }))

  const clearError = () => {
    Store.update((s) => {
      s.error = undefined
    })
  }

  return (
    <Dialog
      open={!!error}
      maxWidth="xl"
      fullWidth
      disableBackdropClick
      PaperProps={{
        style: {height: 'calc(100% - 64px)'},
      }}
    >
      <DialogTitle>Error</DialogTitle>
      <DialogContent dividers style={{padding: 0, height: '100%', backgroundColor: 'black'}}>
        <ErrorView error={error} />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={clearError}>
          Clear Error
        </Button>
        <Button color="secondary" onClick={restart}>
          Restart
        </Button>
      </DialogActions>
    </Dialog>
  )
}
