import * as React from 'react'

import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core'

import {DialogTitle, styles} from '../../components'

import {keyRemove} from '../../rpc/keys'
import {RPCError, Key, KeyType, KeyRemoveRequest, KeyRemoveResponse} from '../../rpc/keys.d'

type Props = {
  value: Key
  open: boolean
  close: (removed: boolean) => void
}

type State = {
  error: string
}

export default class KeyRemoveDialog extends React.Component<Props, State> {
  state = {
    error: '',
  }

  removeKey = () => {
    const req: KeyRemoveRequest = {kid: this.props.value.id}
    keyRemove(req, (err: RPCError, resp: KeyRemoveResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      this.props.close(true)
    })
  }

  renderDialog(open: boolean) {
    const key = this.props.value
    const isPrivate = key?.type == KeyType.X25519 || key?.type == KeyType.EDX25519

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
        <DialogTitle>Delete Key</DialogTitle>
        <DialogContent dividers>{isPrivate ? this.renderPrivateKey() : this.renderPublicKey()}</DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.close(false)}>Cancel</Button>
          <Button autoFocus onClick={this.removeKey} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderPrivateKey() {
    return (
      <Box>
        <Typography style={{paddingBottom: 20}}>
          Are you really sure you want to delete this <span style={{fontWeight: 600}}>private</span> key?
        </Typography>
        <Typography style={{...styles.mono, paddingBottom: 20}}>{this.props.value?.id}</Typography>
        <Typography>
          <span style={{fontWeight: 600}}>
            If you haven't backed up the key, you won't be able to recover it.
          </span>
        </Typography>
      </Box>
    )
  }

  renderPublicKey() {
    return (
      <Box>
        <Typography style={{paddingBottom: 20}}>Do you want to delete this public key?</Typography>
        <Typography style={{...styles.mono, paddingBottom: 20}}>{this.props.value?.id}</Typography>
      </Box>
    )
  }

  render() {
    return this.renderDialog(this.props.open)
    /* <Step
        title="Delete Key"
        prev={{label: 'Cancel', action: this.props.close}}
        next={{label: 'Yes, Delete', action: this.removeKey}}
        >
        {this.renderContent()}
        </Step> */
  }
}

// const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
//   return {kid: query(state, 'kid')}
// }

// export default connect(mapStateToProps)(KeyRemoveView)
