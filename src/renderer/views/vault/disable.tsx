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

import {styles, DialogTitle, Link} from '../../components'
import {shell} from 'electron'

import {vaultUnsync} from '../../rpc/keys'
import {RPCError, VaultUnsyncRequest, VaultUnsyncResponse} from '../../rpc/keys.d'

type Props = {
  open: boolean
  close: (snack: string) => void
}

type State = {
  error: string
  loading: boolean
}

export default class DisableDialog extends React.Component<Props, State> {
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

  vaultDelete = () => {
    this.setState({loading: true, error: ''})
    const req: VaultUnsyncRequest = {}
    vaultUnsync(req, (err: RPCError, resp: VaultUnsyncResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.close('')
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
        <DialogTitle loading={this.state.loading}>Delete from Server</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column">
            <Typography style={{fontWeight: 600}}>
              Are you sure you want to remove the vault backup from the server and disable syncing?
            </Typography>
            <Typography>
              This will permanently delete the vault from the server. Other devices that sync with this vault
              will also stop. For more details, see{' '}
              <Link span onClick={() => shell.openExternal('https://keys.pub/docs/specs/vault.html')}>
                keys.pub/docs/specs/vault
              </Link>
              .
            </Typography>
            <Typography style={{color: 'red'}}>{this.state.error}</Typography>
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
