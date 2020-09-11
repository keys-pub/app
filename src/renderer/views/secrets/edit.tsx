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

import {DialogTitle} from '../../components'
import {deepCopy} from '../helper'
import {mono} from '../theme'

import PasswordOptions from './pw'

import {randPassword} from '../../rpc/keys'
import {
  Secret,
  SecretSaveRequest,
  SecretSaveResponse,
  SecretType,
  RandPasswordRequest,
  RandPasswordResponse,
  Encoding,
} from '../../rpc/keys.d'
import {secretSave} from '../../rpc/keys'

type Props = {
  secret: Secret
  isNew: boolean
  onChange: (secret: Secret) => void
  cancel: () => void
}

type State = {
  errorName?: Error
  loading: boolean
  secret: Secret
  passwordVisible: boolean
}

export default class SecretEditView extends React.Component<Props, State> {
  state: State = {
    loading: false,
    passwordVisible: false,
    secret: deepCopy(this.props.secret),
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.secret != prevProps.secret) {
      this.setState({secret: deepCopy(this.props.secret)})
    }
  }

  save = async () => {
    if (!this.state.secret.name?.trim()) {
      this.setState({errorName: new Error('Name is required')})
      return
    }

    this.setState({loading: true, errorName: undefined})
    try {
      const req: SecretSaveRequest = {
        secret: this.state.secret,
      }
      const resp = await secretSave(req)
      this.setState({loading: false, secret: resp.secret!})
      this.props.onChange(resp.secret!)
    } catch (err) {
      this.setState({loading: false})
    }
  }

  onChange = (e: React.ChangeEvent<{value: unknown}>, fieldName: string) => {
    const value = e.target.value as string
    const secret = deepCopy(this.state.secret)
    secret[fieldName] = value
    const state = {errorName: undefined, secret: secret} as State
    this.setState(state)
  }

  generatePassword = () => {
    // TODO: Prompt to overwrite
    // TODO: Keep saved password history
    randPassword({length: 14}).then((resp: RandPasswordResponse) => {
      const secret = deepCopy(this.state.secret)
      secret.password = resp.password
      this.setState({secret})
    })
    // TODO: Catch error
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
        value={this.state.secret.type}
        onChange={(e) => this.onChange(e, 'type')}
        style={{width: 200, height: 32}}
      >
        <MenuItem value={SecretType.PASSWORD_SECRET}>Password</MenuItem>
        {/* <MenuItem value={SecretType.CONTACT_SECRET}>Contact</MenuItem>
        <MenuItem value={SecretType.CARD_SECRET}>Card</MenuItem> */}
        <MenuItem value={SecretType.NOTE_SECRET}>Note</MenuItem>
      </Select>
    )
  }

  renderPassword() {
    return (
      <Box display="flex" flexDirection="column">
        {!this.state.errorName && <Typography style={labelStyle}>Name</Typography>}
        {this.state.errorName && (
          <Typography style={labelStyle}>
            <span style={errStyle}>{this.state.errorName.message}</span>
          </Typography>
        )}
        <TextField
          onChange={(e) => this.onChange(e, 'name')}
          value={this.state.secret.name}
          inputProps={{maxLength: 128}}
          style={{...valueStyle}}
        />

        <Typography style={labelStyle}>Username</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'username')}
          value={this.state.secret.username}
          inputProps={{maxLength: 128}}
          style={{...valueStyle}}
        />

        <Box display="flex" flexDirection="row" flex={1} style={{position: 'relative'}}>
          <Box display="flex" flexDirection="column" style={{width: '100%'}}>
            <Typography style={labelStyle}>Password</Typography>
            <TextField
              fullWidth
              onChange={(e) => this.onChange(e, 'password')}
              value={this.state.secret.password}
              type={this.state.passwordVisible ? '' : 'password'}
              inputProps={{maxLength: 128}}
              InputProps={{style: {...mono}}}
              style={{...valueStyle}}
            />
          </Box>
          <Box style={{position: 'absolute', right: 0, top: 6}}>
            <PasswordOptions
              password={this.state.secret.password!}
              visible={this.state.passwordVisible}
              setVisible={(visible: boolean) => this.setState({passwordVisible: visible})}
              generate={this.generatePassword}
            />
          </Box>
        </Box>

        <Typography style={labelStyle}>URL</Typography>
        <TextField
          onChange={(e) => this.onChange(e, 'url')}
          value={this.state.secret.url}
          inputProps={{maxLength: 256}}
          style={{...valueStyle}}
        />

        <FormControl>
          <TextField
            label="Notes"
            variant="outlined"
            onChange={(e) => this.onChange(e, 'notes')}
            value={this.state.secret.notes}
            multiline
            rows={8}
            // InputProps={{style: {paddingRight: 0}}}
          />
        </FormControl>
        <Box display="flex" flexGrow={1} />
      </Box>
    )
  }

  renderNote() {
    return (
      <Box display="flex" flexDirection="column">
        {!this.state.errorName && <Typography style={labelStyle}>Name</Typography>}
        {this.state.errorName && (
          <Typography style={labelStyle}>
            <span style={errStyle}>{this.state.errorName.message}</span>
          </Typography>
        )}
        <TextField
          onChange={(e) => this.onChange(e, 'name')}
          value={this.state.secret.name}
          inputProps={{maxLength: 128}}
          style={{marginBottom: 20}}
        />

        <FormControl style={{marginBottom: 10}}>
          <TextField
            label="Notes"
            variant="outlined"
            onChange={(e) => this.onChange(e, 'notes')}
            value={this.state.secret.notes}
            multiline
            rows={8}
            // InputProps={{style: {paddingRight: 0}}}
          />
        </FormControl>
      </Box>
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        {this.renderEditActions()}
        <Divider />
        <Box display="flex" flexDirection="row" flex={1}>
          <Divider orientation="vertical" />
          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            style={{
              overflowY: 'auto',
              height: 'calc(100vh - 94px)',
              paddingTop: 10,
              paddingRight: 10,
            }}
          >
            {this.props.isNew && (
              <FormControl style={{marginLeft: 14, marginBottom: 20}}>{this.renderTypeSelect()}</FormControl>
            )}

            <Box display="flex" flexDirection="column" flex={1} style={{marginLeft: 14}}>
              {this.state.secret.type == SecretType.PASSWORD_SECRET && this.renderPassword()}
              {this.state.secret.type == SecretType.NOTE_SECRET && this.renderNote()}
            </Box>
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
  paddingBottom: 2,
  fontSize: '0.857rem',
  height: 20,
}

const valueStyle = {
  marginTop: -5,
  height: 49,
}

const errStyle = {
  color: 'red',
}
