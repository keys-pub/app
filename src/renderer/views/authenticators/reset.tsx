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

import {reset} from '../../rpc/fido2'
import {
  RPCError,
  Device,
  DeviceInfo,
  Option,
  DeviceInfoRequest,
  DeviceInfoResponse,
  ResetRequest,
  ResetResponse,
} from '../../rpc/fido2.d'
import {toHex} from '../helper'

type Props = {
  device: Device
  open: boolean
  close: (snack: string) => void
}

type State = {
  error: string
  loading: boolean
}

export default class ResetDialog extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
  }

  clear = () => {
    this.setState({error: '', loading: false})
  }

  close = (snack: string) => {
    this.clear()
    this.props.close(snack)
  }

  reset = () => {
    this.setState({loading: true, error: ''})
    const req: ResetRequest = {
      device: this.props.device.path,
    }
    reset(req, (err: RPCError, resp: ResetResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.close('Device was reset')
    })
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
        <Typography style={{color: 'red'}}>{this.state.error}&nbsp;</Typography>
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
        <DialogTitle loading={this.state.loading}>Reset</DialogTitle>
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
