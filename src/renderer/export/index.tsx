import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'
import {CopyIcon} from '../icons'

import {KeyLabel} from '../key/label'
import {clipboard} from 'electron'

import {DialogTitle} from '../components/dialog'
import {Key, ExportType, KeyExportRequest, KeyExportResponse} from '@keys-pub/tsclient/lib/keys'

import {keys} from '../rpc/client'
import {openSnack, closeSnack, openSnackError} from '../snack'

type Props = {
  k: Key
  open: boolean
  close: () => void
}

type State = {
  export: string
  password: string
  passwordConfirm: string
}

export default class KeyExportDialog extends React.Component<Props, State> {
  state: State = {
    export: '',
    password: '',
    passwordConfirm: '',
  }

  export = async () => {
    const password = this.state.password
    const confirm = this.state.passwordConfirm
    if (password != confirm) {
      openSnackError(new Error("Passwords don't match"))
      return
    }
    let noPassword = false
    if (!password) {
      noPassword = true
    }

    try {
      const req: KeyExportRequest = {
        kid: this.props.k.id,
        password: this.state.password,
        noPassword: noPassword,
        public: false,
        type: ExportType.DEFAULT_EXPORT_TYPE,
      }
      const resp = await keys.keyExport(req)
      const out = new TextDecoder().decode(resp.export)
      this.setState({password: '', passwordConfirm: '', export: out})
    } catch (err) {
      openSnackError(err)
    }
  }

  reset = () => {
    closeSnack()
    this.setState({password: '', passwordConfirm: '', export: ''})
  }

  close = () => {
    this.props.close()
    setTimeout(this.reset, 200)
  }

  onInputChangePassword = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : ''})
  }

  onInputChangeConfirm = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({passwordConfirm: target ? target.value : ''})
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.export)
    openSnack({message: 'Copied to Clipboard', duration: 2000})
  }

  renderExport() {
    return (
      <Box display="flex" flexDirection="column">
        <Box style={{paddingBottom: 20}}>
          <KeyLabel k={this.props.k} full />
        </Box>
        <TextField
          autoFocus
          label="Password"
          placeholder="Password"
          variant="outlined"
          type="password"
          onChange={this.onInputChangePassword}
          value={this.state.password}
        />
        <Box padding={1} />
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          onChange={this.onInputChangeConfirm}
          value={this.state.passwordConfirm}
        />
      </Box>
    )
  }

  renderExported() {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{position: 'relative'}}
      >
        <Typography
          variant="body2"
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            width: '100%',
            height: '100%',
          }}
        >
          {this.state.export}
        </Typography>
        <Box style={{position: 'absolute', right: 0, top: 0}}>
          <IconButton
            onClick={this.copyToClipboard}
            size="small"
            style={{padding: 4, backgroundColor: 'white'}}
          >
            <CopyIcon />
          </IconButton>
        </Box>
      </Box>
    )
  }

  render() {
    return (
      <Dialog
        onClose={this.props.close}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle onClose={this.props.close}>Export Key</DialogTitle>
        <DialogContent>
          {this.state.export == '' && this.renderExport()}
          {this.state.export !== '' && this.renderExported()}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Close</Button>
          {this.state.export == '' && (
            <Button color="primary" onClick={this.export}>
              Export
            </Button>
          )}
        </DialogActions>
      </Dialog>
    )
  }
}
