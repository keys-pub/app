import * as React from 'react'

import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core'

import {DialogTitle, styles} from '../../components'

import {secretRemove} from '../../rpc/keys'
import {RPCError, Secret, SecretRemoveRequest, SecretRemoveResponse} from '../../rpc/keys.d'

type Props = {
  value: Secret
  open: boolean
  close: (removed: boolean) => void
}

type State = {
  error: string
}

export default class SecretRemoveDialog extends React.Component<Props, State> {
  state = {
    error: '',
  }

  remove = () => {
    const req: SecretRemoveRequest = {id: this.props.value.id}
    secretRemove(req, (err: RPCError, resp: SecretRemoveResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      this.props.close(true)
    })
  }

  renderDialog(open: boolean) {
    const secret = this.props.value

    return (
      <Dialog
        onClose={() => this.props.close(false)}
        open={open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle>Delete Secret</DialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography style={{paddingBottom: 20}}>Do you want to delete this secret?</Typography>
            <Typography style={{...styles.mono, paddingBottom: 10}}>{this.props.value?.name}</Typography>
            {this.props.value?.username && (
              <Typography style={{...styles.mono, paddingBottom: 10}}>
                {this.props.value?.username}
              </Typography>
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

  render() {
    return this.renderDialog(this.props.open)
  }
}
