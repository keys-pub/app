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

import {styles, DialogTitle} from '../../components'
import {Key, KeyExportRequest, KeyExportResponse, RPCError} from '../../rpc/keys.d'

import {keyExport} from '../../rpc/keys'

type Props = {
  kid: string
  open: boolean
  close: () => void
}

type State = {
  export: string
  password: string
  passwordConfirm: string
  error: string
}

export default class KeyExportDialog extends React.Component<Props, State> {
  state = {
    export: '',
    password: '',
    passwordConfirm: '',
    error: '',
  }

  export = async () => {
    const password = this.state.password
    const confirm = this.state.passwordConfirm
    if (password !== confirm) {
      this.setState({
        error: "Passwords don't match",
      })
      return
    }
    if (password === '') {
      this.setState({
        error: 'Oops, password is empty',
      })
      return
    }

    this.setState({error: ''})
    const req: KeyExportRequest = {kid: this.props.kid, password: this.state.password}
    keyExport(req, (err: RPCError, resp: KeyExportResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      const out = new TextDecoder().decode(resp.export)
      this.setState({password: '', passwordConfirm: '', export: out})
    })
  }

  close = () => {
    this.props.close()
    this.setState({password: '', passwordConfirm: '', export: '', error: ''})
  }

  onInputChangePassword = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: ''})
  }

  onInputChangeConfirm = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({passwordConfirm: target ? target.value : '', error: ''})
  }

  renderExport() {
    // TODO: Export type
    return (
      <Box display="flex" flexDirection="column" style={{height: 200}}>
        <Typography style={{paddingBottom: 10}}>Export a key encrypted with a password.</Typography>
        <Typography style={{...styles.mono, paddingBottom: 20}}>{this.props.kid}</Typography>
        <FormControl error={this.state.error !== ''}>
          <TextField
            autoFocus
            label="Password"
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
          <FormHelperText id="component-error-text">{this.state.error || ' '}</FormHelperText>
        </FormControl>
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
        style={{height: 200}}
      >
        <Typography
          style={{
            ...styles.mono,
            backgroundColor: 'black',
            color: 'white',
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
        <DialogTitle>Export Key</DialogTitle>
        <DialogContent dividers>
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

// const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
//   return {
//     kid: query(state, 'kid'),
//   }
// }

// export default connect(mapStateToProps)(KeyExportView)
