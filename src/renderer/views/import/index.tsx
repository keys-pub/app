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

import {RPCError, KeyImportRequest, KeyImportResponse} from '../../rpc/types'
import {keyImport} from '../../rpc/rpc'

type Props = {
  open: boolean
  close: (imported: boolean) => void
}

type State = {
  error: string
  in: string
  loading: boolean
  password: string
}

export default class KeyImportDialog extends React.Component<Props, State> {
  state = {
    error: '',
    in: '',
    loading: false,
    password: '',
  }

  reset = () => {
    this.setState({error: '', in: '', loading: false, password: ''})
  }

  close = (added: boolean) => {
    this.reset()
    this.props.close(added)
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
      this.setState({loading: false})
      this.close(true)
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
        <DialogTitle loading={this.state.loading}>Import Key</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column">
            <Typography style={{paddingBottom: 20}}>
              You can specify a public key ID or an encrypted key and password.
            </Typography>
            <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
              <TextField
                multiline
                autoFocus
                label="Import Key"
                rows={6}
                variant="outlined"
                placeholder={''}
                onChange={this.onInputChange}
                value={this.state.in}
                InputProps={{
                  style: {...styles.mono},
                }}
              />
            </FormControl>
            <FormControl error={this.state.error !== ''}>
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                onChange={this.onPasswordInputChange}
                value={this.state.password}
              />
              <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.close(false)}>Close</Button>
          <Button color="primary" onClick={this.importKey}>
            Import
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
