import * as React from 'react'

import {connect} from 'react-redux'

import {Divider, Box, Input, LinearProgress, Typography} from '@material-ui/core'

import {debounce} from 'lodash'

import DecryptedView from './decrypted'
import DecryptedFileView from './decryptedfile'
import {store} from '../../store'

import {styles, Link} from '../../components'
import {query} from '../state'
import * as grpc from '@grpc/grpc-js'
import {remote} from 'electron'

import {DecryptState} from '../../reducers/decrypt'
import {decryptFile} from '../../rpc/keys'
import {Key, EncryptMode, RPCError, DecryptFileInput, DecryptFileOutput} from '../../rpc/keys.d'

export type Props = {
  defaultValue: string
  file: string
  fileOut: string
  fileMode: EncryptMode
  fileSender: Key
}

type State = {
  fileError: string
  loading: boolean
  value: string
}

class DecryptView extends React.Component<Props, State> {
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

  setDefaultValue = (v: string) => {
    store.dispatch({type: 'DECRYPT_VALUE', payload: {value: v}})
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.file != prevProps.file && this.props.file) {
      this.decryptFile()
    }
  }

  decryptFile = async () => {
    const req: DecryptFileInput = {
      in: this.props.file,
    }

    console.log('Decrypting...')
    this.setState({loading: true, fileError: ''})
    const send = decryptFile((err: RPCError, resp: DecryptFileOutput, done: boolean) => {
      if (err) {
        if (err.code == grpc.status.CANCELLED) {
          this.setState({loading: false})
        } else {
          this.setState({loading: false, fileError: err.details})
        }
        return
      }
      if (resp) {
        store.dispatch({
          type: 'DECRYPT_FILE_OUT',
          payload: {fileOut: resp.out, fileSender: resp.sender, fileMode: resp.mode},
        })
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
      store.dispatch({type: 'DECRYPT_FILE', payload: {file}})
    }
  }

  clearFile = () => {
    this.cancel()
    this.setState({fileError: ''})
    store.dispatch({type: 'DECRYPT_FILE', payload: {file: ''}})
    store.dispatch({type: 'DECRYPT_FILE_OUT', payload: {fileOut: '', fileSender: null}})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{overflow: 'hidden'}}>
        <Box style={{position: 'relative', height: '40%'}}>
          {this.props.file && (
            <Box style={{paddingTop: 8, paddingLeft: 8}}>
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
                  spellCheck: 'false',
                  ref: this.inputRef,
                  style: {
                    ...styles.mono,
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
                    Enter encrypted text or{' '}
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
            height: '60%',
            width: '100%',
          }}
        >
          {(this.props.fileOut || this.state.fileError) && (
            <DecryptedFileView
              fileOut={this.props.fileOut}
              sender={this.props.fileSender}
              mode={this.props.fileMode}
              error={this.state.fileError}
            />
          )}
          {!this.state.fileError && !this.props.fileOut && <DecryptedView value={this.state.value} />}
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {decrypt: DecryptState; router: any}, ownProps: any) => {
  return {
    defaultValue: state.decrypt.value || '',
    file: state.decrypt.file || '',
    fileOut: state.decrypt.fileOut || '',
    fileSender: state.decrypt.fileSender || null,
  }
}

export default connect(mapStateToProps)(DecryptView)
