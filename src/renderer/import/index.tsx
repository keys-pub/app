import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  LinearProgress,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {DialogTitle} from '../components/dialog'

import {KeyImportRequest, KeyImportResponse} from '@keys-pub/tsclient/lib/keys'
import {keys} from '../rpc/client'
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
}

export default class KeyImportDialog extends React.Component<Props, State> {
  state: State = {
    imported: '',
    in: '',
    loading: false,
    password: '',
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
      const resp = await keys.keyImport({
        in: input,
        password: this.state.password,
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
        <Typography style={{paddingBottom: 16}}>You can specify a key ID, an SSH or Saltpack key:</Typography>
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
