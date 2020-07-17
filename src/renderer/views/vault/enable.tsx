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

import {vaultSync} from '../../rpc/keys'
import {RPCError, VaultSyncRequest, VaultSyncResponse} from '../../rpc/keys.d'
import {toHex} from '../helper'

type Props = {
  open: boolean
  close: (snack: string) => void
}

type State = {
  error: string
  loading: boolean
}

export default class EnableDialog extends React.Component<Props, State> {
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

  enable = () => {
    this.setState({loading: true, error: ''})
    const req: VaultSyncRequest = {}
    vaultSync(req, (err: RPCError, resp: VaultSyncResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.close('Sync enabled')
    })
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
        <DialogTitle loading={this.state.loading}>Sync</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column">
            <Typography>Are you sure you want to enable sync?</Typography>
            <Typography style={{color: 'red'}}>{this.state.error}&nbsp;</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.close('')} disabled={this.state.loading}>
            Close
          </Button>
          <Box flexGrow={1} />
          <Button color="primary" onClick={this.enable} disabled={this.state.loading}>
            Enable
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
