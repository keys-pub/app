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

import {Error} from '../store'

import ErrorView from './view'

type Props = {
  error: Error
  clear: () => void
  restart: () => void
}

export default (props: Props) => {
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
      <DialogContent dividers style={{padding: 0, height: '100%', backgroundColor: 'black'}}>
        {props.error && <ErrorView error={props.error} />}
      </DialogContent>
      <DialogActions>
        {/* <Button color="primary" onClick={props.clear}>
          Clear Error
        </Button> */}
        <Button color="secondary" onClick={props.restart}>
          Restart
        </Button>
      </DialogActions>
    </Dialog>
  )
}
