import * as React from 'react'

import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core'

import {DialogTitle, styles} from '../../components'

import {keyRemove} from '../../rpc/keys'
import {Key, KeyType, KeyRemoveRequest, KeyRemoveResponse} from '../../rpc/keys.d'

type Props = {
  keyRemove?: Key
  close: (removed: boolean) => void
}

type State = {
  error?: Error
}

export default class KeyRemoveDialog extends React.Component<Props, State> {
  setError = (err: Error) => {
    this.setState({error: err})
  }

  removeKey = () => {
    if (!this.props.keyRemove) return
    const req: KeyRemoveRequest = {kid: this.props.keyRemove.id}
    keyRemove(req)
      .then((resp: KeyRemoveResponse) => {
        this.props.close(true)
      })
      .catch(this.setError)
  }

  renderDialog() {
    const key = this.props.keyRemove
    const isPrivate = key?.type == KeyType.X25519 || key?.type == KeyType.EDX25519

    return (
      <Dialog
        onClose={() => this.props.close(false)}
        open={!!key}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle onClose={() => this.props.close(false)}>Delete Key</DialogTitle>
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
        <Typography style={{paddingBottom: 10}}>
          Are you really sure you want to delete this <span style={{fontWeight: 600}}>private</span> key?
        </Typography>
        <Typography style={{...styles.mono, paddingBottom: 10, fontWeight: 600}}>
          {this.props.keyRemove?.id}
        </Typography>
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
        <Typography style={{paddingBottom: 10}}>Do you want to delete this public key?</Typography>
        <Typography style={{...styles.mono}}>{this.props.keyRemove?.id}</Typography>
      </Box>
    )
  }

  render() {
    return this.renderDialog()
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
