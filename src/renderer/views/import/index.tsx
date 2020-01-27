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

import {styles, Step} from '../../components'

import {store} from '../../store'
import {goBack, push, replace} from 'connected-react-router'

import {keyImport, RPCError} from '../../rpc/rpc'
import {KeyImportRequest, KeyImportResponse} from '../../rpc/types'

type State = {
  in: string
  password: string
  error: string
}

export default class KeyImportView extends React.Component<{}, State> {
  state = {
    in: '',
    password: '',
    error: '',
  }

  importKey = () => {
    const input = new TextEncoder().encode(this.state.in)
    const req: KeyImportRequest = {
      in: input,
      password: this.state.password,
    }
    store.dispatch(
      keyImport(
        req,
        (resp: KeyImportResponse) => {
          store.dispatch(replace('/keys/key/index?kid=' + resp.kid))
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
  }

  back = () => {
    store.dispatch(goBack())
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({in: target.value, error: ''})
  }

  onPasswordInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target.value, error: ''})
  }

  render() {
    return (
      <Step
        title="Import Key"
        prev={{label: 'Cancel', action: this.back}}
        next={{label: 'Import', action: this.importKey}}
      >
        <Box display="flex" flexDirection="column">
          <Typography style={{paddingBottom: 20}}>
            You can specify an encrypted key (for a private key) or a key ID (for a public key).
          </Typography>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20, width: 550}}>
            <TextField
              multiline
              autoFocus
              label="Import Key"
              rows={6}
              variant="outlined"
              placeholder={''}
              onChange={this.onInputChange}
              value={this.state.in}
              InputProps={{
                style: {...styles.mono},
              }}
            />
          </FormControl>
          <FormControl error={this.state.error !== ''} style={{marginBottom: 20, width: 550}}>
            <TextField
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
