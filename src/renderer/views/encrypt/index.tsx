import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, LinearProgress, Typography, Box} from '@material-ui/core'

import {Link, styles} from '../../components'
import RecipientsView from '../user/recipients'
import EncryptedView from './encrypted'
import EncryptedFileView from './encryptedfile'
import SignKeySelectView from '../keys/skselect'

import {remote} from 'electron'
import {store} from '../../store'
import {query} from '../state'
import {debounce} from 'lodash'
import * as grpc from '@grpc/grpc-js'

import {EncryptState} from '../../reducers/encrypt'
import {encrypt, RPCState} from '../../rpc/rpc'
import {client} from '../../rpc/client'

import {Key, RPCError, EncryptFileInput, EncryptFileOutput} from '../../rpc/types'

export type Props = {
  recipients: Key[]
  signer: string
  defaultValue: string
  file: string
  fileOut: string
}

type State = {
  fileError: string
  loading: boolean
  value: string
}

class EncryptView extends React.Component<Props, State> {
  state = {
    fileError: '',
    loading: false,
    value: this.props.defaultValue,
  }
  encrypter: any
  inputRef: any = React.createRef()

  debounceDefaultValue = debounce((v: string) => this.setDefaultValue(v), 1000)

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', fileError: ''})
    this.debounceDefaultValue(target.value || '')
  }

  setRecipients = (recipients: Key[]) => {
    store.dispatch({type: 'ENCRYPT_RECIPIENTS', payload: {recipients}})
  }

  setSigner = (kid: string) => {
    store.dispatch({type: 'ENCRYPT_SIGNER', payload: {signer: kid}})
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
        this.props.signer != prevProps.signer ||
        this.props.recipients != prevProps.recipients) &&
      this.canEncryptFile()
    ) {
      this.encryptFile()
    }
  }

  encryptFile = async () => {
    const recs = this.props.recipients.map((r: Key) => {
      return r.id
    })

    const fileOut = this.props.file + '.enc'

    const req: EncryptFileInput = {
      recipients: recs,
      signer: this.props.signer,
      in: this.props.file,
      out: fileOut,
    }
    if (this.encrypter) {
      console.error('already have encrypt client')
      return
    }

    console.log('Encrypting...')
    this.setState({loading: true, fileError: ''})
    const cl = await client()
    this.encrypter = cl.encryptFile()
    this.encrypter.on('data', (out: EncryptFileOutput) => {
      console.log('Encrypt:', out)
      store.dispatch({type: 'ENCRYPT_FILE_OUT', payload: {fileOut}})
      this.setState({loading: false})
    })
    this.encrypter.on('error', (err: RPCError) => {
      this.encrypter = null
      console.error(err)
      if (err.code == grpc.status.CANCELLED) {
        this.setState({loading: false})
      } else {
        this.setState({loading: false, fileError: err.details})
      }
    })
    this.encrypter.on('end', () => {
      console.log('Encrypt end')
      this.encrypter = null
    })
    this.encrypter.write(req)
    this.encrypter.end()
  }

  cancel = () => {
    if (this.encrypter) {
      console.log('Cancel')
      this.encrypter.cancel()
    }
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
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%', position: 'relative'}}>
        <Divider />
        <Box style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 6, paddingRight: 2}}>
          <RecipientsView
            recipients={this.props.recipients}
            disabled={this.state.loading}
            onChange={this.setRecipients}
          />
        </Box>
        <Divider />
        <SignKeySelectView
          defaultValue={this.props.signer}
          onChange={this.setSigner}
          disabled={this.state.loading}
          placeholder="Anonymous"
          itemLabel="Signed by"
        />
        <Divider />

        {this.props.file && (
          <Box style={{height: '50%', paddingTop: 8, paddingLeft: 8}}>
            <Typography style={{...styles.mono, display: 'inline'}}>{this.props.file}&nbsp;</Typography>
            <Link inline onClick={this.clearFile}>
              Clear
            </Link>
          </Box>
        )}
        {!this.props.file && (
          <Box style={{position: 'relative', height: '50%', paddingLeft: 8, paddingTop: 8}}>
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
                  overflowY: 'scroll',
                },
              }}
              style={{
                height: '100%',
                width: '100%',
              }}
            />
            {!this.state.value && (
              <Box style={{position: 'absolute', top: 10, left: 10}}>
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
        {!this.state.loading && <Divider style={{marginTop: 3}} />}
        {this.state.loading && <LinearProgress />}
        <Box
          style={{
            height: '50%',
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
              signer={this.props.signer}
            />
          )}
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; encrypt: EncryptState; router: any}, ownProps: any) => {
  return {
    recipients: state.encrypt.recipients || [],
    signer: state.encrypt.signer || '',
    defaultValue: state.encrypt.value || '',
    file: state.encrypt.file || '',
    fileOut: state.encrypt.fileOut || '',
  }
}
export default connect(mapStateToProps)(EncryptView)
