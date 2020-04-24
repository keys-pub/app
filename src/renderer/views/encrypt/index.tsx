import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, LinearProgress, Typography, Box} from '@material-ui/core'

import {Link, styles} from '../../components'
import AutocompletesView from '../keys/autocompletes'
import EncryptedView from './encrypted'
import EncryptedFileView from './encryptedfile'
import SignKeySelectView from '../keys/select'

import {remote} from 'electron'
import {store} from '../../store'
import {debounce} from 'lodash'
import * as grpc from '@grpc/grpc-js'

import {EncryptState} from '../../reducers/encrypt'
import {encryptFile} from '../../rpc/keys'
import {Key, RPCError, EncryptFileInput, EncryptFileOutput} from '../../rpc/service.keys.d'

export type Props = {
  recipients: string[]
  sender: string
  defaultValue: string
  file: string
  fileOut: string
}

type State = {
  fileError: string
  loading: boolean
  value: string
}

// TODO: Option to include self/sender
// TODO: Default sender

class EncryptView extends React.Component<Props, State> {
  state = {
    fileError: '',
    loading: false,
    value: this.props.defaultValue,
  }
  inputRef: any = React.createRef()

  debounceDefaultValue = debounce((v: string) => this.setDefaultValue(v), 1000)

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', fileError: ''})
    this.debounceDefaultValue(target.value || '')
  }

  setRecipients = (recipients: string[]) => {
    store.dispatch({type: 'ENCRYPT_RECIPIENTS', payload: {recipients}})
  }

  setSender = (kid: string) => {
    store.dispatch({type: 'ENCRYPT_SENDER', payload: {sender: kid}})
  }

  setDefaultValue = (v: string) => {
    store.dispatch({type: 'ENCRYPT_VALUE', payload: {value: v}})
  }

  canEncryptFile = () => {
    return this.props.file && this.props.recipients.length > 0
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      (this.props.file != prevProps.file ||
        this.props.sender != prevProps.sender ||
        this.props.recipients != prevProps.recipients) &&
      this.canEncryptFile()
    ) {
      this.encryptFile()
    }
  }

  encryptFile = async () => {
    const fileOut = this.props.file + '.enc'

    const req: EncryptFileInput = {
      recipients: this.props.recipients,
      sender: this.props.sender,
      in: this.props.file,
      out: fileOut,
    }

    console.log('Encrypting...')
    this.setState({loading: true, fileError: ''})
    const send = encryptFile((err: RPCError, resp: EncryptFileOutput, done: boolean) => {
      if (err) {
        if (err.code == grpc.status.CANCELLED) {
          this.setState({loading: false})
        } else {
          this.setState({loading: false, fileError: err.details})
        }
        return
      }
      if (resp) {
        store.dispatch({type: 'ENCRYPT_FILE_OUT', payload: {fileOut}})
      }
      if (done) {
        this.setState({loading: false})
      }
    })
    send(req, false)
  }

  cancel = () => {
    // TODO: stream cancel
  }

  openFile = async () => {
    this.setState({fileError: ''})
    const win = remote.getCurrentWindow()
    const open = await remote.dialog.showOpenDialog(win, {})
    if (open.canceled) {
      return
    }
    if (open.filePaths.length == 1) {
      const file = open.filePaths[0]
      store.dispatch({type: 'ENCRYPT_FILE', payload: {file}})
    }
  }

  clearFile = () => {
    this.cancel()
    this.setState({fileError: ''})
    store.dispatch({type: 'ENCRYPT_FILE', payload: {file: ''}})
    store.dispatch({type: 'ENCRYPT_FILE_OUT', payload: {fileOut: ''}})
  }

  render() {
    return (
      <Box
        display="flex"
        flex={1}
        flexDirection="column"
        style={{height: '100%', position: 'relative', overflow: 'hidden'}}
      >
        <Box style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 6, paddingRight: 2}}>
          <AutocompletesView
            identities={this.props.recipients}
            disabled={this.state.loading}
            onChange={this.setRecipients}
            placeholder="Recipients"
            addOptions={true}
          />
        </Box>
        <Divider />
        <SignKeySelectView
          defaultValue={this.props.sender}
          onChange={this.setSender}
          disabled={this.state.loading}
          placeholder="Anonymous"
          itemLabel="Signed by"
        />
        <Divider />
        <Box style={{position: 'relative', height: '47%'}}>
          {this.props.file && (
            <Box style={{paddingTop: 6, paddingLeft: 8}}>
              <Typography style={{...styles.mono, display: 'inline'}}>{this.props.file}&nbsp;</Typography>
              <Link inline onClick={this.clearFile}>
                Clear
              </Link>
            </Box>
          )}
          {!this.props.file && (
            <Box style={{height: '100%'}}>
              <Input
                multiline
                autoFocus
                onChange={this.onInputChange}
                value={this.state.value}
                disableUnderline
                inputProps={{
                  ref: this.inputRef,
                  style: {
                    height: '100%',
                    overflow: 'auto',
                    paddingTop: 8,
                    paddingLeft: 8,
                    paddingBottom: 0,
                    paddingRight: 0,
                  },
                }}
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
              {!this.state.value && (
                <Box style={{position: 'absolute', top: 6, left: 8}}>
                  <Typography
                    style={{display: 'inline', color: '#a2a2a2'}}
                    onClick={() => this.inputRef.current.focus()}
                  >
                    Type text or{' '}
                  </Typography>
                  <Link inline onClick={this.openFile}>
                    select a file
                  </Link>
                  <Typography style={{display: 'inline'}}>.</Typography>
                </Box>
              )}
            </Box>
          )}
          <Box style={{position: 'absolute', bottom: 0, width: '100%'}}>
            {!this.state.loading && <Divider />}
            {this.state.loading && <LinearProgress />}
          </Box>
        </Box>
        <Box
          style={{
            height: '53%',
            width: '100%',
          }}
        >
          {this.state.fileError ||
            (this.props.fileOut && (
              <EncryptedFileView fileOut={this.props.fileOut} error={this.state.fileError} />
            ))}
          {!this.state.fileError && !this.props.fileOut && (
            <EncryptedView
              recipients={this.props.recipients}
              value={this.state.value}
              sender={this.props.sender}
            />
          )}
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {encrypt: EncryptState; router: any}, ownProps: any) => {
  return {
    recipients: state.encrypt.recipients || [],
    sender: state.encrypt.sender || '',
    defaultValue: state.encrypt.value || '',
    file: state.encrypt.file || '',
    fileOut: state.encrypt.fileOut || '',
  }
}
export default connect(mapStateToProps)(EncryptView)
