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

import {Device, SetPINRequest, SetPINResponse} from '@keys-pub/tsclient/lib/fido2'
import {fido2} from '../rpc/client'

type Props = {
  device: Device
  create: boolean
  open: boolean
  close: (snack: string) => void
}

type State = {
  error?: Error
  oldPin: string
  pin: string
  confirmPin: string
  loading: boolean
}

export default class SetPinDialog extends React.Component<Props, State> {
  state: State = {
    oldPin: '',
    pin: '',
    confirmPin: '',
    loading: false,
  }

  reset = () => {
    this.setState({error: undefined, oldPin: '', pin: '', confirmPin: '', loading: false})
  }

  close = (snack: string) => {
    this.reset()
    this.props.close(snack)
  }

  setPin = async () => {
    if (this.state.pin != this.state.confirmPin) {
      this.setState({error: new Error("PINs don't match")})
      return
    }

    this.setState({loading: true, error: undefined})
    try {
      const resp = await fido2.setPIN({
        device: this.props.device.path,
        oldPin: this.state.oldPin,
        pin: this.state.pin,
      })
      this.setState({loading: false})
      this.close('PIN successfully set')
    } catch (err) {
      this.setState({loading: false, error: err})
    }
  }

  onPinChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({pin: target.value, error: undefined})
  }

  onPinOldChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({oldPin: target.value, error: undefined})
  }

  onPinConfirmChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({confirmPin: target.value, error: undefined})
  }

  renderCreate() {
    return (
      <Box display="flex" flexDirection="column">
        <FormControl error={!!this.state.error}>
          <TextField
            autoFocus
            variant="outlined"
            label="New PIN"
            type="password"
            onChange={this.onPinChange}
            value={this.state.pin}
          />
          <FormHelperText> </FormHelperText>
        </FormControl>
        <FormControl error={!!this.state.error}>
          <TextField
            variant="outlined"
            label="Confirm PIN"
            type="password"
            onChange={this.onPinConfirmChange}
            value={this.state.confirmPin}
          />
          <FormHelperText>{this.state.error?.message || ' '}</FormHelperText>
        </FormControl>
      </Box>
    )
  }

  renderChange() {
    return (
      <Box display="flex" flexDirection="column">
        <FormControl style={{paddingBottom: 20}}>
          <TextField
            variant="outlined"
            autoFocus
            label="Old PIN"
            type="password"
            onChange={this.onPinOldChange}
            value={this.state.oldPin}
          />
        </FormControl>
        <FormControl>
          <TextField
            variant="outlined"
            label="New PIN"
            type="password"
            onChange={this.onPinChange}
            value={this.state.pin}
          />
          <FormHelperText> </FormHelperText>
        </FormControl>
        <FormControl error={!!this.state.error}>
          <TextField
            variant="outlined"
            label="Confirm PIN"
            type="password"
            onChange={this.onPinConfirmChange}
            value={this.state.confirmPin}
          />
          <FormHelperText>{this.state.error?.message || ' '}</FormHelperText>
        </FormControl>
      </Box>
    )
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={() => this.props.close('')}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle loading={this.state.loading} onClose={() => this.props.close('')}>
          {this.props.create ? 'Create a PIN' : 'Change PIN'}
        </DialogTitle>
        <DialogContent>
          {this.props.create && this.renderCreate()}
          {!this.props.create && this.renderChange()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.close('')}>Close</Button>
          <Button color="primary" onClick={this.setPin}>
            {this.props.create ? 'Create' : 'Change'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
