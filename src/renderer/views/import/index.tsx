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

import {styles, DialogTitle} from '../../components'

import {RPCError, KeyImportRequest, KeyImportResponse} from '../../rpc/keys.d'
import {keyImport} from '../../rpc/keys'

type Props = {
  open: boolean
  close: (imported: boolean) => void
}

type State = {
  error: string
  in: string
  loading: boolean
  password: string
  imported: string
}

export default class KeyImportDialog extends React.Component<Props, State> {
  state = {
    error: '',
    imported: '',
    in: '',
    loading: false,
    password: '',
  }

  reset = () => {
    this.setState({error: '', in: '', loading: false, password: '', imported: ''})
  }

  close = () => {
    const added = this.state.imported != ''
    this.props.close(added)
    setTimeout(this.reset, 200)
  }

  importKey = async () => {
    this.setState({loading: true, error: ''})
    const input = new TextEncoder().encode(this.state.in)
    const req: KeyImportRequest = {
      in: input,
      password: this.state.password,
    }
    keyImport(req, (err: RPCError, resp: KeyImportResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false, imported: resp.kid})
    })
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({in: target.value, error: ''})
  }

  onPasswordInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target.value, error: ''})
  }

  renderImport() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={{paddingBottom: 16}}>You can specify a key ID, an SSH or Saltpack key:</Typography>
        <FormControl error={this.state.error !== ''} style={{marginBottom: 10}}>
          <TextField
            multiline
            autoFocus
            label="Import Key"
            rows={8}
            variant="outlined"
            placeholder={''}
            onChange={this.onInputChange}
            value={this.state.in}
            inputProps={{
              spellCheck: false,
              style: {...styles.mono, fontSize: 12},
            }}
          />
        </FormControl>
        <FormControl error={this.state.error !== ''} style={{marginBottom: -10}}>
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            onChange={this.onPasswordInputChange}
            value={this.state.password}
          />
          <FormHelperText id="component-error-text">{this.state.error || ' '}</FormHelperText>
        </FormControl>
      </Box>
    )
  }

  renderImported() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={{paddingBottom: 10}}>We imported the key:</Typography>
        <Typography style={{...styles.mono, paddingBottom: 10, paddingLeft: 10}}>
          {this.state.imported}
        </Typography>
      </Box>
    )
  }

  render() {
    return (
      <Dialog
        onClose={() => this.props.close(false)}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle loading={this.state.loading} onClose={() => this.props.close(false)}>
          Import Key
        </DialogTitle>
        <DialogContent dividers>
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
