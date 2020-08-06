import * as React from 'react'

import {Avatar, Box, Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core'

import {TransitionProps} from '@material-ui/core/transitions'

import {DialogTitle} from '../../components'
import KeyView from './view'

import {styles} from '../../components'

import {key, pull} from '../../rpc/keys'
import {RPCError, Key, KeyRequest, KeyResponse, PullRequest, PullResponse} from '../../rpc/keys.d'

type Props = {
  open: boolean
  close: (snack: string) => void
  kid: string
  search?: boolean
  update?: boolean
  import?: boolean
  reload?: () => void
}

type State = {
  error: string
  loading: boolean
  key: Key
  openExport: boolean
  openRemove: boolean
}

// const transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />
// })

export default class KeyDialog extends React.Component<Props, State> {
  state = {
    error: '',
    export: false,
    loading: false,
    key: null,
    openExport: false,
    openRemove: false,
  }

  close = (snack: string) => {
    this.props.close(snack)
  }

  componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
    if (this.props.kid !== prevProps.kid) {
      this.loadKey(this.props.update, false)
    }
  }

  loadKey = (update: boolean, reload: boolean) => {
    if (!this.props.kid) {
      this.setState({key: null})
      return
    }

    this.setState({loading: true, error: ''})
    const req: KeyRequest = {
      key: this.props.kid,
      search: this.props.search,
      update: update,
    }
    key(req, (err: RPCError, resp: KeyResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (resp.key) {
        this.setState({key: resp.key, loading: false})
      } else {
        this.setState({error: 'Key not found', loading: false})
      }
      if (reload && this.props.reload) {
        this.props.reload()
      }
    })
  }

  refresh = (update: boolean) => {
    this.loadKey(update, true)
  }

  import = () => {
    this.setState({loading: true, error: ''})
    const req: PullRequest = {
      key: this.props.kid,
    }
    pull(req, (err: RPCError, resp: PullResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.close('Imported key')
    })
  }

  render() {
    return (
      <Dialog
        onClose={this.close}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle loading={this.state.loading} onClose={() => this.close('')}>
          Key
        </DialogTitle>
        <DialogContent dividers style={{minHeight: 161}}>
          {/*TODO: Better error display*/}
          {this.state.error && (
            <Typography style={{...styles.mono, ...styles.breakWords, color: 'red', paddingBottom: 20}}>
              {this.state.error}
            </Typography>
          )}
          {this.state.key && <KeyView value={this.state.key} refresh={this.refresh} />}
        </DialogContent>
        <DialogActions>
          {this.props.import && (
            <Box display="flex" flexDirection="row">
              <Button onClick={() => this.close('')}>Close</Button>
              <Button color="primary" onClick={this.import} disabled={this.state.loading}>
                Import
              </Button>
            </Box>
          )}
          {!this.props.import && <Button onClick={() => this.close('')}>Close</Button>}
        </DialogActions>
      </Dialog>
    )
  }
}
