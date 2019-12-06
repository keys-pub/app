// @flow
import React, {Component} from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@material-ui/core'

import {styles, Link, Step} from '../components'

import {currentStatus, keyEmpty} from '../state'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {configSet, push as publish} from '../../rpc/rpc'

import type {ConfigSetRequest, ConfigSetResponse, PushRequest, PushResponse} from '../../rpc/types'
import type {AppState, RPCState, RPCError} from '../../reducers/app'

type Props = {
  open: boolean,
  dispatch: (action: any) => any,
}

type State = {
  error: ?string,
  loading: boolean,
}

class AuthPublishDialog extends Component<Props, State> {
  state = {
    error: null,
    loading: false,
  }

  close = () => {
    this.props.dispatch({type: 'PROMPT_PUBLISH', payload: false})
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle disableTypography style={{paddingBottom: 10}}>
          <Typography id="alert-dialog-title" variant="h5">
            Publish your Public Key
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Typography gutterBottom>Do you want to publish your public key to the server?</Typography>
          <Typography gutterBottom>TODO: Fill copy</Typography>
          <Typography gutterBottom>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl
            consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.nothanks(false)} disabled={this.state.loading}>
            Remind me later
          </Button>
          <Button onClick={this.publish} disabled={this.state.loading} color="primary" autoFocus>
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  close = () => {
    this.props.dispatch({type: 'PROMPT_PUBLISH', payload: false})
  }

  nothanks = (skip: boolean) => {
    this.props.dispatch(
      configSet({key: 'disablePromptPublish', value: skip ? '1' : '0'}, (resp: ConfigSetResponse) => {
        this.close()
      })
    )
  }

  publish = () => {
    this.setState({loading: true, error: ''})
    const req: PushRequest = {}
    this.props.dispatch(
      publish(
        req,
        (resp: PushResponse) => {
          this.setState({loading: false})
          this.close()
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }
}

const mapStateToProps = (state: {app: AppState, rpc: RPCState}, ownProps: any): any => {
  const status = currentStatus(state.rpc)
  const open = !!state.app.promptPublish && status.promptPublish
  return {
    open,
  }
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(AuthPublishDialog)
