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

import {RPCError, Device, SetPINRequest, SetPINResponse} from '../../rpc/fido2.d'
import {setPIN} from '../../rpc/fido2'

type Props = {
  device: Device
  open: boolean
  close: (snack: string) => void
}

type State = {
  error: string
  oldPin: string
  pin: string
  loading: boolean
}

export default class SetPinDialog extends React.Component<Props, State> {
  state = {
    error: '',
    oldPin: '',
    pin: '',
    loading: false,
  }

  reset = () => {
    this.setState({error: '', oldPin: '', pin: '', loading: false})
  }

  close = (snack: string) => {
    this.reset()
    this.props.close(snack)
  }

  setPin = async () => {
    this.setState({loading: true, error: ''})
    const req: SetPINRequest = {
      device: this.props.device.path,
      oldPin: this.state.oldPin,
      pin: this.state.pin,
    }
    setPIN(req, (err: RPCError, resp: SetPINResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.close('PIN successfully set')
    })
  }

  onPinChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({pin: target.value, error: ''})
  }

  onPinOldChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({oldPin: target.value, error: ''})
  }

  renderPinChange() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={{paddingBottom: 20}}>
          Set the PIN. If an old PIN was set, you'll need to enter that too.
        </Typography>
        <FormControl style={{paddingBottom: 20}}>
          <TextField
            variant="outlined"
            autoFocus
            label="Old PIN"
            onChange={this.onPinOldChange}
            value={this.state.oldPin}
          />
        </FormControl>
        <FormControl error={this.state.error !== ''}>
          <TextField variant="outlined" label="New PIN" onChange={this.onPinChange} value={this.state.pin} />
          <FormHelperText id="component-error-text">{this.state.error || ' '}</FormHelperText>
        </FormControl>
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
        <DialogTitle loading={this.state.loading}>PIN</DialogTitle>
        <DialogContent dividers>{this.renderPinChange()}</DialogContent>
        <DialogActions>
          <Button onClick={() => this.close('')}>Close</Button>
          <Button color="primary" onClick={this.setPin}>
            Change
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
