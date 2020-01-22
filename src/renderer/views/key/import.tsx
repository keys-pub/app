import * as React from 'react'

import {
  Box,
  Button,
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {Step} from '../../components'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {keyImport, RPCError} from '../../rpc/rpc'
import {KeyImportRequest, KeyImportResponse} from '../../rpc/types'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  keyBackup: string
  password: string
  error: string
}

class KeyImportView extends React.Component<Props, State> {
  state = {
    keyBackup: '',
    password: '',
    error: '',
  }

  importKey = () => {
    const keyBackup = new TextEncoder().encode(this.state.keyBackup)
    const req: KeyImportRequest = {
      in: keyBackup,
      password: this.state.password,
    }
    this.props.dispatch(
      keyImport(
        req,
        (resp: KeyImportResponse) => {
          this.props.dispatch(push('/key/index?kid=' + resp.kid))
        },
        (err: RPCError) => {
          this.setState({error: err.message})
        }
      )
    )
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  onBackupInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({keyBackup: target.value, error: ''})
  }

  onPasswordInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target.value, error: ''})
  }

  render() {
    return (
      <Step
        title="Import your Key"
        prev={{label: 'Back', action: this.back}}
        next={{label: 'Import', action: this.importKey}}
      >
        <Box>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
            <TextField
              multiline
              autoFocus
              label="Key"
              rows={5}
              variant="outlined"
              placeholder={''}
              onChange={this.onBackupInputChange}
              value={this.state.keyBackup}
            />
            <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
          </FormControl>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20}}>
            <TextField
              autoFocus
              label="Password"
              variant="outlined"
              type="password"
              onChange={this.onPasswordInputChange}
              value={this.state.password}
            />
            <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
          </FormControl>
        </Box>
      </Step>
    )
  }
}

export default connect()(KeyImportView)
