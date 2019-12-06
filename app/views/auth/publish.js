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
  Divider,
  IconButton,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import {shell} from 'electron'

import CloseIcon from '@material-ui/icons/Close'

import {styles, Link, Step} from '../components'

import {currentStatus, keyEmpty} from '../state'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {configSet, push as publish, status} from '../../rpc/rpc'

import type {
  ConfigSetRequest,
  ConfigSetResponse,
  PushRequest,
  PushResponse,
  StatusRequest,
} from '../../rpc/types'
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

  close = (event: any, reason: string) => {
    // if (reason === 'backdropClick') return
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
        <Box display="flex" flex={1} flexDirection="column">
          <Box display="flex" flex={1} flexDirection="row">
            <Typography
              id="alert-dialog-title"
              variant="h5"
              style={{paddingBottom: 7, paddingLeft: 20, paddingTop: 15, width: '100%', fontWeight: 600}}
            >
              Publish your Key
            </Typography>
            {/*<IconButton aria-label="close" onClick={event => this.close(event, 'button')}>
              <CloseIcon />
            </IconButton>
            */}
          </Box>
          {!this.state.loading && <Divider style={{marginBottom: 3}} />}
          {this.state.loading && <LinearProgress />}
        </Box>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You've created your key. Do you want to publish your public key to the server? This allows others
            to search for it. For more information, see{' '}
            <Link inline onClick={() => shell.openExternal('https://docs.keys.pub/specs/key#publickey')}>
              docs.keys.pub/specs/key
            </Link>
            .
          </DialogContentText>
          {this.state.error && (
            <Typography style={{color: 'red', paddingBottom: 10}}>Error: {this.state.error}</Typography>
          )}
          <Box display="flex" flexDirection="column" style={{alignItems: 'center'}}>
            <Button
              color="primary"
              variant="outlined"
              style={{
                width: 200,
                height: 50,
                fontSize: 18,
                marginBottom: 20,
              }}
              disabled={this.state.loading}
              onClick={event => this.publish(event)}
            >
              Publish
            </Button>

            <Box marginBottom={2}>
              <Typography>
                <Link
                  inline={true}
                  onClick={event => this.nothanks(event, false)}
                  style={{width: 300, textAlign: 'center'}}
                >
                  Remind me later
                </Link>
                &nbsp; &mdash; &nbsp;
                <Link
                  inline
                  onClick={event => this.nothanks(event, true)}
                  style={{width: 300, textAlign: 'center'}}
                >
                  Don't remind me
                </Link>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  nothanks = (event: any, skip: boolean) => {
    this.props.dispatch(
      configSet({key: 'disablePromptPublish', value: skip ? '1' : '0'}, (resp: ConfigSetResponse) => {
        this.close(event, 'button')
      })
    )
  }

  publish = (event: any) => {
    this.setState({loading: true, error: ''})
    const req: PushRequest = {}
    this.props.dispatch(
      publish(
        req,
        (resp: PushResponse) => {
          this.close(event, 'publish')
          this.props.dispatch(status({}))
          this.setState({loading: false})
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
