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

import {DialogTitle, Link} from '../components'
import {shell} from 'electron'

import {keys} from '../rpc/client'
import {VaultUnsyncRequest, VaultUnsyncResponse} from '@keys-pub/tsclient/lib/keys'

type Props = {
  open: boolean
  close: (snack: string) => void
}

type State = {
  error?: Error
  loading: boolean
}

export default class DisableDialog extends React.Component<Props, State> {
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

  vaultDelete = async () => {
    this.setState({loading: true, error: undefined})
    try {
      const resp = await keys.VaultUnsync({})
      this.setState({loading: false})
      this.close('')
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
          Delete Vault Sync
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column">
            <Typography>
              <span style={{fontWeight: 600}}>
                Are you sure you want to remove the vault backup from the server and disable syncing?&nbsp;
              </span>
              This will permanently delete the vault from the server. Other devices that sync with this vault
              will also stop. For more details, see{' '}
              <Link span href="https://keys.pub/docs/specs/vault.html">
                keys.pub/docs/specs/vault
              </Link>
              .
            </Typography>
            <Typography style={{color: 'red'}}>{this.state.error?.message || ' '}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.close('')} disabled={this.state.loading}>
            Cancel
          </Button>
          <Box flexGrow={1} />
          <Button color="secondary" onClick={this.vaultDelete} disabled={this.state.loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
