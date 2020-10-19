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

import {DialogTitle} from '../components'

import {fido2} from '../rpc/client'
import {
  Device,
  DeviceInfo,
  Option,
  DeviceInfoRequest,
  DeviceInfoResponse,
  ResetRequest,
  ResetResponse,
} from '@keys-pub/tsclient/lib/fido2.d'
import {toHex} from '../helper'

type Props = {
  device: Device
  open: boolean
  close: (snack: string) => void
}

type State = {
  error?: Error
  loading: boolean
}

export default class ResetDialog extends React.Component<Props, State> {
  state: State = {
    loading: false,
  }

  clear = () => {
    this.setState({error: undefined, loading: false})
  }

  close = (snack: string) => {
    this.clear()
    this.props.close(snack)
  }

  reset = async () => {
    this.setState({loading: true, error: undefined})
    try {
      const resp = await fido2.Reset({
        device: this.props.device.path,
      })

      this.setState({loading: false})
      this.close('Device was reset')
    } catch (err) {
      this.setState({loading: false, error: err})
    }
  }

  renderContent() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={{fontSize: '1.1em'}}>
          Are you sure you want to reset {this.props.device.product}?
        </Typography>
        <Typography>&nbsp;</Typography>
        <Typography>
          Resetting varies depending on the authenticator. Some authenticators will will fail if a reset is
          issued later than 5 seconds after power-up or if the user fails to confirm the reset by touching the
          key within 30 seconds.
        </Typography>
        <Typography style={{color: 'red'}}>{this.state.error?.message || ' '}</Typography>
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
          Reset
        </DialogTitle>
        <DialogContent dividers>{this.renderContent()}</DialogContent>
        <DialogActions>
          <Button onClick={() => this.close('')} disabled={this.state.loading}>
            Close
          </Button>
          <Box flexGrow={1} />
          <Button color="primary" onClick={this.reset} disabled={this.state.loading}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
