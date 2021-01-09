import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  LinearProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {DialogTitle} from '../components/dialog'

import {KeyImportRequest, KeyImportResponse} from '@keys-pub/tsclient/lib/rpc'
import {rpc} from '../rpc/client'
import {openSnackError} from '../snack'

type Props = {
  open: boolean
  close: (imported: string) => void
}

type State = {
  in: string
  loading: boolean
  password: string
  imported: string
  update: boolean
}

export default class KeyImportDialog extends React.Component<Props, State> {
  state: State = {
    imported: '',
    in: '',
    loading: false,
    password: '',
    update: true,
  }

  reset = () => {
    this.setState({in: '', loading: false, password: '', imported: ''})
  }

  close = () => {
    this.props.close(this.state.imported)
    setTimeout(this.reset, 200)
  }

  importKey = async () => {
    this.setState({loading: true})
    const input = new TextEncoder().encode(this.state.in)
    try {
      const resp = await rpc.keyImport({
        in: input,
        password: this.state.password,
        update: this.state.update,
      })
      this.setState({loading: false, imported: resp.kid || ''})
    } catch (err) {
      this.setState({loading: false})
      openSnackError(err)
    }
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({in: target.value})
  }

  onPasswordInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target.value})
  }

  renderImport() {
    return (
      <Box display="flex" flexDirection="column">
        <TextField
          multiline
          autoFocus
          label="Key"
          rows={8}
          variant="outlined"
          onChange={this.onInputChange}
          value={this.state.in}
          fullWidth
          inputProps={{
            spellCheck: false,
          }}
        />
        <Box style={{marginBottom: 10}} />
        <TextField
          placeholder="Password (optional)"
          variant="outlined"
          type="password"
          onChange={this.onPasswordInputChange}
          value={this.state.password}
        />
        <Box style={{margin: 4}} />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.update}
              color="primary"
              onChange={() => this.setState({update: !this.state.update})}
              style={{paddingTop: 0, paddingBottom: 0}}
            />
          }
          label="Update from keys.pub"
        />
      </Box>
    )
  }

  renderImported() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={{paddingBottom: 10}}>We imported the key:</Typography>
        <Typography variant="body2" style={{paddingBottom: 10, paddingLeft: 10}}>
          {this.state.imported}
        </Typography>
      </Box>
    )
  }

  render() {
    return (
      <Dialog
        onClose={() => this.props.close('')}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle loading={this.state.loading} onClose={() => this.props.close('')}>
          Import Key
        </DialogTitle>
        <DialogContent>
          {!this.state.imported && this.renderImport()}
          {this.state.imported && this.renderImported()}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Close</Button>
          {!this.state.imported && (
            <Button color="primary" onClick={this.importKey}>
              Import
            </Button>
          )}
        </DialogActions>
      </Dialog>
    )
  }
}
