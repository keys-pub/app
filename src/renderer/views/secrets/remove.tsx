import * as React from 'react'

import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core'

import {DialogTitle} from '../../components'

import {secretRemove} from '../../rpc/keys'
import {Secret, SecretRemoveRequest, SecretRemoveResponse} from '../../rpc/keys.d'

type Props = {
  open: boolean
  secret?: Secret
  close: (removed: boolean) => void
}

type State = {}

export default class SecretRemoveDialog extends React.Component<Props, State> {
  remove = () => {
    if (!this.props.secret) return
    const req: SecretRemoveRequest = {id: this.props.secret.id}
    secretRemove(req).then((resp: SecretRemoveResponse) => {
      this.props.close(true)
    })
    // TODO: Catch error
  }

  render() {
    return (
      <Dialog
        onClose={() => this.props.close(false)}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle onClose={() => this.props.close(false)}>Delete Secret</DialogTitle>
        <DialogContent dividers>
          <Box style={{paddingBottom: 10}}>
            <Typography style={{paddingBottom: 10}}>Do you want to delete this secret?</Typography>
            <Typography variant="body2">{this.props.secret?.name}</Typography>
            {this.props.secret?.username && (
              <Typography variant="body2">{this.props.secret?.username}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.close(false)}>Cancel</Button>
          <Button autoFocus onClick={this.remove} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
