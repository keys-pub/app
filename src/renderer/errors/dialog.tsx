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

import {DialogTitle} from '../components/dialog'

import {Error} from '../store'

import ErrorView from './view'
import {ipcRenderer} from 'electron'

type Props = {
  error: Error
}

export default (props: Props) => {
  const exit = () => {
    ipcRenderer.send('exit', {})
  }

  const restart = () => {
    ipcRenderer.send('reload-app', {})
  }

  return (
    <Dialog
      open={!!props.error}
      maxWidth="xl"
      fullWidth
      disableBackdropClick
      PaperProps={{
        style: {height: '100%'},
      }}
    >
      <DialogTitle>Error</DialogTitle>
      <DialogContent style={{padding: 0, height: '100%', backgroundColor: 'black'}}>
        {props.error && <ErrorView error={props.error} />}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={restart}>
          Restart
        </Button>
        <Button color="secondary" onClick={exit}>
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
