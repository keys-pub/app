import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {styles, Link} from '../../components'

import {remote} from 'electron'
import {store} from '../../store'
import {query} from '../state'
import {debounce} from 'lodash'
import * as grpc from '@grpc/grpc-js'

import SignedView from './signed'
import SignFileView from './signedfile'
import SignKeySelectView from '../keys/skselect'

import {SignState} from '../../reducers/sign'
import {sign, RPCState} from '../../rpc/rpc'
import {client} from '../../rpc/client'
import {Key, RPCError, SignFileInput, SignFileOutput} from '../../rpc/types'

export type Props = {
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

class SignView extends React.Component<Props, State> {
  state = {
    fileError: '',
    loading: false,
    value: this.props.defaultValue,
  }
  signer: any
  inputRef: any = React.createRef()

  debounceDefaultValue = debounce((v: string) => this.setDefaultValue(v), 1000)

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', fileError: ''})
    this.debounceDefaultValue(target.value || '')
  }

  setDefaultValue = (v: string) => {
    store.dispatch({type: 'SIGN_VALUE', payload: {value: v}})
  }

  setSigner = (kid: string) => {
    store.dispatch({type: 'SIGN_SIGNER', payload: {signer: kid}})
  }

  canSignFile = () => {
    return this.props.file && this.props.signer
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if ((this.props.file != prevProps.file || this.props.signer != prevProps.signer) && this.canSignFile()) {
      this.signFile()
    }
  }

  signFile = async () => {
    const fileOut = this.props.file + '.sig'

    const req: SignFileInput = {
      signer: this.props.signer,
      in: this.props.file,
      out: fileOut,
    }
    if (this.signer) {
      console.error('already have sign client')
      return
    }

    console.log('Signing...')
    this.setState({loading: true, fileError: ''})
    const cl = await client()
    this.signer = cl.signFile()
    this.signer.on('data', (out: SignFileOutput) => {
      console.log('Sign:', out)
      store.dispatch({type: 'SIGN_FILE_OUT', payload: {fileOut}})
      this.setState({loading: false})
    })
    this.signer.on('error', (err: RPCError) => {
      this.signer = null
      console.error(err)
      if (err.code == grpc.status.CANCELLED) {
        this.setState({loading: false})
      } else {
        this.setState({loading: false, fileError: err.details})
      }
    })
    this.signer.on('end', () => {
      console.log('Sign end')
      this.signer = null
    })
    this.signer.write(req)
    this.signer.end()
  }

  cancel = () => {
    if (this.signer) {
      console.log('Cancel')
      this.signer.cancel()
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
      store.dispatch({type: 'SIGN_FILE', payload: {file}})
    }
  }

  clearFile = () => {
    this.cancel()
    this.setState({fileError: ''})
    store.dispatch({type: 'SIGN_FILE', payload: {file: ''}})
    store.dispatch({type: 'SIGN_FILE_OUT', payload: {fileOut: ''}})
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <SignKeySelectView
          defaultValue={this.props.signer}
          onChange={this.setSigner}
          placeholder="Signer"
          placeholderDisabled
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
              <SignFileView fileOut={this.props.fileOut} error={this.state.fileError} />
            ))}
          {!this.state.fileError && !this.props.fileOut && (
            <SignedView signer={this.props.signer} value={this.state.value} />
          )}
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; sign: SignState; router: any}, ownProps: any) => {
  return {
    signer: state.sign.signer || '',
    defaultValue: state.sign.value || '',
    file: state.sign.file || '',
    fileOut: state.sign.fileOut || '',
  }
}
export default connect(mapStateToProps)(SignView)
