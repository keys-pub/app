import * as React from 'react'

import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core'

import {DialogTitle, styles} from '../../components'

import {keyRemove} from '../../rpc/rpc'
import {RPCError, KeyRemoveRequest, KeyRemoveResponse} from '../../rpc/types'

type Props = {
  kid: string
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
    const req: KeyRemoveRequest = {kid: this.props.kid}
    keyRemove(req, (err: RPCError, resp: KeyRemoveResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      this.props.close(true)
    })
  }

  renderDialog(open: boolean) {
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
        <DialogContent dividers>{this.renderContent()}</DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.close(false)}>Cancel</Button>
          <Button autoFocus onClick={this.removeKey} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderContent() {
    return (
      <Box>
        <Typography style={{paddingBottom: 20}}>Are you really sure you want to delete this key?</Typography>
        <Typography style={{...styles.mono, paddingBottom: 20}}>{this.props.kid}</Typography>
        <Typography style={{paddingBottom: 20}}>
          If you haven't backed up your key, you won't be able to recover it.
        </Typography>
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
