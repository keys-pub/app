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

import {styles, DialogTitle} from '../../components'
import {deepCopy} from '../helper'

import {RPCError, Secret, SecretSaveRequest, SecretSaveResponse, SecretType} from '../../rpc/types'
import {secretSave} from '../../rpc/rpc'

type Props = {
  secret: Secret
  isNew: boolean
  onChange: (secret: Secret) => void
  cancel: () => void
}

type State = {
  error: string
  errorName: string
  loading: boolean
  secret: Secret
}

export default class SecretEditView extends React.Component<Props, State> {
  state = {
    error: '',
    errorName: '',
    loading: false,
    secret: deepCopy(this.props.secret),
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.secret != prevProps.secret) {
      this.setState({secret: deepCopy(this.props.secret)})
    }
  }

  save = async () => {
    if (this.state.secret.name.trim() == '') {
      this.setState({errorName: 'Name is required'})
      return
    }

    this.setState({loading: true, error: '', errorName: ''})
    const req: SecretSaveRequest = {
      secret: this.state.secret,
    }
    secretSave(req, (err: RPCError, resp: SecretSaveResponse) => {
      if (err) {
        // TODO: Error field name
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false, secret: resp.secret})
      this.props.onChange(resp.secret)
    })
  }

  onChange = (e: React.ChangeEvent<{value: unknown}>, fieldName: string) => {
    const value = e.target.value as string
    const secret = deepCopy(this.state.secret)
    secret[fieldName] = value
    const state = {error: '', errorName: '', secret: secret}
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
        value={this.state.secret.type}
        onChange={(e) => this.onChange(e, 'type')}
        style={{width: 200, height: 40}}
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
      <Box display="flex" flexDirection="column" flex={1}>
        <FormControl error={this.state.errorName != ''}>
          <TextField
            label="Name"
            onChange={(e) => this.onChange(e, 'name')}
            value={this.state.secret.name}
            InputProps={{style: styles.mono}}
          />
          <FormHelperText id="component-error-text">{this.state.errorName || ' '}</FormHelperText>
        </FormControl>

        <FormControl>
          <TextField
            label="Username"
            onChange={(e) => this.onChange(e, 'username')}
            value={this.state.secret.username}
            InputProps={{style: styles.mono}}
          />
          <FormHelperText id="component-error-text"> </FormHelperText>
        </FormControl>
        <FormControl>
          <TextField
            label="Password"
            onChange={(e) => this.onChange(e, 'password')}
            value={this.state.secret.password}
            type="password"
            InputProps={{style: styles.mono}}
          />
          <FormHelperText id="component-error-text"> </FormHelperText>
        </FormControl>

        <FormControl style={{marginBottom: 10}}>
          <TextField
            label="URL"
            onChange={(e) => this.onChange(e, 'url')}
            value={this.state.secret.url}
            InputProps={{style: styles.mono}}
          />
          <FormHelperText id="component-error-text"> </FormHelperText>
        </FormControl>

        <FormControl style={{marginBottom: 10}}>
          <TextField
            label="Notes"
            variant="outlined"
            onChange={(e) => this.onChange(e, 'notes')}
            value={this.state.secret.notes}
            multiline
            rows={8}
            InputProps={{style: styles.mono}}
            // InputProps={{style: {paddingRight: 0}}}
          />
        </FormControl>
      </Box>
    )
  }

  renderNote() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <FormControl error={this.state.errorName != ''}>
          <TextField
            label="Name"
            onChange={(e) => this.onChange(e, 'name')}
            value={this.state.secret.name}
            InputProps={{style: styles.mono}}
          />
          <FormHelperText id="component-error-text">{this.state.errorName || ' '}</FormHelperText>
        </FormControl>
        <FormControl style={{marginBottom: 10}}>
          <TextField
            label="Notes"
            variant="outlined"
            onChange={(e) => this.onChange(e, 'notes')}
            value={this.state.secret.notes}
            multiline
            rows={8}
            InputProps={{style: styles.mono}}
            // InputProps={{style: {paddingRight: 0}}}
          />
        </FormControl>
      </Box>
    )
  }

  render() {
    if (!this.state.secret) return null

    return (
      <Box display="flex" flexDirection="column" flex={1}>
        {this.renderEditActions()}
        <Divider />
        <Box display="flex" flexDirection="column" style={{marginLeft: 10, marginTop: 10, marginRight: 10}}>
          {this.state.error && <Alert severity="error">{this.state.error}</Alert>}
          {this.props.isNew && <FormControl style={{marginBottom: 8}}>{this.renderTypeSelect()}</FormControl>}
          <Box display="flex" flexDirection="column" marginLeft={1} marginRight={1}>
            {this.state.secret.type == SecretType.PASSWORD_SECRET && this.renderPassword()}
            {this.state.secret.type == SecretType.NOTE_SECRET && this.renderNote()}
          </Box>
        </Box>
      </Box>
    )
  }
}
