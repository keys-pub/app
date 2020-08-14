import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  LinearProgress,
  Typography,
} from '@material-ui/core'

import {statementRevoke} from '../../rpc/keys'
import {StatementRevokeRequest, StatementRevokeResponse} from '../../rpc/keys.d'

type Props = {
  kid: string
  open: boolean
  seq: number
  close: () => any
}

type State = {
  error?: Error
  loading: boolean
}

export default class UserRevokeDialog extends React.Component<Props, State> {
  state: State = {
    loading: false,
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box display="flex" flex={1} flexDirection="column">
          <Box display="flex" flex={1} flexDirection="row">
            <Typography
              id="alert-dialog-title"
              variant="h5"
              style={{paddingBottom: 7, paddingLeft: 20, paddingTop: 15, width: '100%', fontWeight: 600}}
            >
              Revoke
            </Typography>
          </Box>
          {!this.state.loading && <Divider style={{marginBottom: 3}} />}
          {this.state.loading && <LinearProgress />}
        </Box>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to revoke this user statement?
          </DialogContentText>
          {this.state.error && (
            <Typography style={{color: 'red', paddingBottom: 10}}>Error: {this.state.error}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.close}>Cancel</Button>
          <Button onClick={this.revoke} color="primary">
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  revoke = (event: any) => {
    this.setState({loading: true, error: undefined})
    const req: StatementRevokeRequest = {
      kid: this.props.kid,
      seq: this.props.seq,
      local: false,
    }
    statementRevoke(req)
      .then((resp: StatementRevokeResponse) => {
        this.props.close()
        this.setState({loading: false})
      })
      .catch((err: Error) => {
        this.setState({loading: false, error: err})
      })
  }
}
