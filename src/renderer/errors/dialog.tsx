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

import {ipcRenderer} from 'electron'
import ErrorView from './view'

type Props = {
  error: Error | void
  clearError: () => void
}

export default class ErrorsDialog extends React.Component<Props> {
  restart = () => {
    ipcRenderer.send('reload-app', {})
  }

  render() {
    return (
      <Dialog
        open={!!this.props.error}
        maxWidth="xl"
        fullWidth
        disableBackdropClick
        PaperProps={{
          style: {height: 'calc(100% - 64px)'},
        }}
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent dividers style={{padding: 0}}>
          <ErrorView error={this.props.error} />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.props.clearError}>
            Clear Error
          </Button>
          <Button color="secondary" onClick={this.restart}>
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
