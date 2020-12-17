import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  LinearProgress,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import {DialogTitle} from '../components/dialog'
import {deepCopy, fromHex} from '../helper'

import {fido2} from '../rpc/client'
import {Device, MakeCredentialRequest, MakeCredentialResponse} from '@keys-pub/tsclient/lib/fido2'

type Props = {
  device: Device
  onChange: () => void
  cancel: () => void
}

type Credential = {
  clientDataHash: string
  rpID: string
  rpName: string
  userID: string
  userName: string
  type: string
}

type State = {
  error?: Error
  loading: boolean
  credential?: Credential
}

export default class MakeCredentialView extends React.Component<Props, State> {
  state: State = {
    loading: false,
  }

  save = async () => {
    if (!this.state.credential) return

    this.setState({loading: true, error: undefined})
    try {
      const req: MakeCredentialRequest = {
        device: this.props.device.path,
        clientDataHash: fromHex(this.state.credential.clientDataHash),
        rp: {
          id: this.state.credential.rpID,
          name: this.state.credential.rpName,
        },
        user: {
          id: fromHex(this.state.credential.userID),
          name: this.state.credential.userName,
          displayName: '',
          icon: '',
        },
        type: this.state.credential.type,
        pin: '',
        extensions: [],
        rk: '',
        uv: '',
      }
      const resp = await fido2.makeCredential(req)
      this.setState({loading: false})
      this.props.onChange()
    } catch (err) {
      this.setState({loading: false, error: err})
    }
  }

  onChange = (e: React.ChangeEvent<{value: unknown}>, fieldName: string) => {
    const value = e.target.value as string
    const credential = deepCopy(this.state.credential)
    credential[fieldName] = value
    const state: State = {loading: false, error: undefined, credential: credential as Credential}
    this.setState(state)
  }

  renderEditActions() {
    return (
      <Box
        display="flex"
        flexDirection="row"
        style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 8, height: 34}}
      >
        <Button
          onClick={this.props.cancel}
          color="secondary"
          variant="outlined"
          size="small"
          style={{marginTop: 2, width: 55}}
        >
          Cancel
        </Button>
        <Box display="flex" flexGrow={1} />
        <Button
          color="primary"
          variant="outlined"
          size="small"
          onClick={this.save}
          style={{marginTop: 2, width: 55, marginRight: 10}}
        >
          Save
        </Button>
      </Box>
    )
  }

  renderTypeSelect() {
    return (
      <Select
        labelId="secret-type-label"
        id="secret-type-select"
        variant="outlined"
        value={this.state.credential?.type}
        onChange={(e) => this.onChange(e, 'type')}
        style={{width: 200, height: 32}}
      >
        <MenuItem value={'es256'}>ES256</MenuItem>
      </Select>
    )
  }

  renderCredential() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography style={labelStyle}>ClientDataHash</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'clientDataHash')}
          value={this.state.credential?.clientDataHash}
          inputProps={{maxLength: 128}}
          style={{marginBottom: 20}}
        />
        <Typography style={labelStyle}>Relying Party ID</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'rp')}
          value={this.state.credential?.rpID}
          inputProps={{maxLength: 128}}
          style={{marginBottom: 19}}
        />
        <Typography style={labelStyle}>Relying Party Name</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'rp')}
          value={this.state.credential?.rpID}
          inputProps={{maxLength: 128}}
          style={{marginBottom: 19}}
        />
        <Typography style={labelStyle}>User ID</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'rp')}
          value={this.state.credential?.rpID}
          inputProps={{maxLength: 128}}
          style={{marginBottom: 19}}
        />
        <Typography style={labelStyle}>User Name</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'rp')}
          value={this.state.credential?.rpID}
          inputProps={{maxLength: 128}}
          style={{marginBottom: 19}}
        />
        <FormControl style={{marginBottom: 20}}>{this.renderTypeSelect()}</FormControl>
      </Box>
    )
  }

  render() {
    if (!this.props.device) return null

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
        {this.renderEditActions()}
        <Divider />
        <Box
          display="flex"
          flexDirection="column"
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            right: 10,
            bottom: 0,
            overflowY: 'auto',
          }}
        >
          {this.state.error && (
            <Box marginBottom={2}>
              <Alert severity="error">{this.state.error?.message}</Alert>
            </Box>
          )}
          <Box display="flex" flexDirection="column" marginLeft={1} marginRight={1}>
            {this.renderCredential()}
          </Box>
        </Box>
      </Box>
    )
  }
}

const labelStyle = {
  transform: 'scale(0.75)',
  transformOrigin: 'top left',
  color: 'rgba(0, 0, 0, 0.54)',
  marginTop: -1,
  marginBottom: -3,
  fontSize: '0.857rem',
}

const errStyle = {
  color: 'red',
}
