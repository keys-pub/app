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

import {keys} from '../rpc/client'
import {VaultSyncRequest, VaultSyncResponse} from '@keys-pub/tsclient/lib/keys'
import {toHex} from '../helper'

type Props = {
  open: boolean
  close: (snack: string) => void
}

type State = {
  error?: Error
  loading: boolean
}

export default class EnableDialog extends React.Component<Props, State> {
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

  enable = async () => {
    this.setState({loading: true, error: undefined})
    try {
      const resp = await keys.VaultSync({})
      this.setState({loading: false})
      this.close('Sync enabled')
    } catch (err) {
      this.setState({loading: false, error: err})
    }
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
          Sync
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column">
            <Typography>Are you sure you want to enable sync?</Typography>
            <Typography style={{color: 'red'}}>{this.state.error?.message}</Typography>
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
