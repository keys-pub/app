import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Paper,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles} from '../../components'
import {dateString, pluralize} from '../helper'

import SetPinDialog from './setpin'
import ResetDialog from './reset'

import Alert from '@material-ui/lab/Alert'

import {store} from '../../store'

import {credentials, deviceInfo, relyingParties, retryCount} from '../../rpc/fido2'
import {
  RPCError,
  Device,
  DeviceInfo,
  DeviceInfoRequest,
  DeviceInfoResponse,
  RelyingParty,
  RelyingPartiesRequest,
  RelyingPartiesResponse,
  RetryCountRequest,
  RetryCountResponse,
  Credential,
  CredentialsRequest,
  CredentialsResponse,
  Option,
} from '../../rpc/fido2.d'
import {toHex} from '../helper'

import CredentialsList from './credentials-list'

type Props = {
  device: Device
}

type State = {
  loading: boolean
  error: string
  openSnack: string
  pin: string
  pinInput: string
  credentials: Array<Credential>
  step: string
  retryCount: number
  clientPin: string
  credMgmt: string
}

export default class DeviceCredentialsView extends React.Component<Props, State> {
  state = {
    loading: false,
    error: '',
    openSnack: '',
    pinInput: '',
    pin: '',
    credentials: [],
    step: '',
    retryCount: -1,
    clientPin: '',
    credMgmt: '',
  }

  componentDidMount() {
    this.info()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.device != prevProps.device) {
      this.clear()
      this.info()
    }
  }

  clear = () => {
    this.setState({pinInput: '', pin: '', error: '', credentials: [], step: ''})
  }

  info = () => {
    if (!this.props.device) {
      return
    }

    this.setState({loading: true, error: ''})
    const req: DeviceInfoRequest = {
      device: this.props.device.path,
    }
    deviceInfo(req, (err: RPCError, resp: DeviceInfoResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details, step: ''})
        return
      }

      let clientPin = ''
      const optClientPin = resp.info.options.find((opt: Option) => opt.name == 'clientPin')
      if (optClientPin) {
        clientPin = optClientPin.value
      }
      let credMgmt = ''
      const optCredMgmt = resp.info.options.find((opt: Option) => opt.name == 'credMgmt')
      if (optCredMgmt) {
        credMgmt = optCredMgmt.value
      }

      this.setState({
        loading: false,
        clientPin,
        credMgmt,
        step: 'pin',
      })
    })
  }

  credentials = () => {
    if (!this.props.device) {
      return
    }

    this.setState({loading: true})
    const req: CredentialsRequest = {
      device: this.props.device.path,
      pin: this.state.pin,
    }
    credentials(req, (err: RPCError, resp: CredentialsResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details, pin: '', step: 'pin', retryCount: -1})
        if (err.code == 3) {
          // Invalid pin
          this.pinRetryCount()
        }
        return
      }
      this.setState({
        step: 'credentials',
        credentials: resp.credentials,
        loading: false,
      })
    })
  }

  pinRetryCount = () => {
    const req: RetryCountRequest = {
      device: this.props.device.path,
    }
    retryCount(req, (err: RPCError, resp: RetryCountResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details, pin: '', step: 'pin'})
        return
      }
      this.setState({
        retryCount: resp.count,
        loading: false,
      })
    })
  }

  //   rps = () => {
  //     if (!this.props.device) {
  //       this.setState({error: '', loading: false})
  //       return
  //     }

  //     this.setState({loading: true, error: ''})
  //     const req: RelyingPartiesRequest = {
  //       device: this.props.device.path,
  //     }
  //     relyingParties(req, (err: RPCError, resp: RelyingPartiesResponse) => {
  //       if (err) {
  //         this.setState({loading: false, error: err.details})
  //         return
  //       }
  //       this.setState({
  //         rps: resp.parties,
  //         loading: false,
  //       })
  //     })
  //   }

  onPinChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({pinInput: target.value, error: ''})
  }

  setPin = () => {
    this.setState({pin: this.state.pinInput}, () => {
      this.credentials()
    })
  }

  renderPin() {
    return (
      <Box display="flex" flexDirection="column" flex={1} alignItems="center" style={{marginTop: 20}}>
        <Box display="flex" flexDirection="row">
          <TextField
            variant="outlined"
            label="PIN"
            type="password"
            onChange={this.onPinChange}
            value={this.state.pinInput}
          />
          <Button
            color="primary"
            variant="outlined"
            onClick={this.setPin}
            style={{marginLeft: 10, height: 54}}
            disabled={this.state.loading}
          >
            OK
          </Button>
        </Box>
        <Box marginTop={2} />
        {this.state.error && <Typography style={{color: 'red'}}>{this.state.error}</Typography>}
        {this.state.error == 'pin invalid' && this.state.retryCount >= 0 && (
          <Typography>You have {pluralize(this.state.retryCount, 'retry', 'retries')} left.</Typography>
        )}
      </Box>
    )
  }

  renderError() {
    return (
      <Box marginTop={2}>
        <Typography style={{color: 'red'}}>{this.state.error}</Typography>
      </Box>
    )
  }

  renderStep() {
    return (
      <Box>
        {this.state.step == '' && this.state.error && this.renderError()}
        {this.state.step == 'pin' && this.renderPin()}
        {this.state.step == 'credentials' && <CredentialsList credentials={this.state.credentials} />}
      </Box>
    )
  }

  render() {
    if (!this.props.device) return null

    if (this.state.step == '' && this.state.loading) return null

    const status = credStatus(this.state.credMgmt, this.state.clientPin)

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
        {/* {this.renderActions()}
        <Divider /> */}

        {status && (
          <Box display="flex" flexDirection="column" flex={1} alignItems="center" style={{marginTop: 20}}>
            <Typography>{status}</Typography>
          </Box>
        )}
        {!status && this.renderStep()}

        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'right'}}
          open={!!this.state.openSnack}
          autoHideDuration={4000}
          onClose={() => this.setState({openSnack: ''})}
        >
          <Alert severity="success">
            <Typography>{this.state.openSnack}</Typography>
          </Alert>
        </Snackbar>
      </Box>
    )
  }
}

const credStatus = (credMgmt, clientPin) => {
  if (credMgmt != 'true') {
    return "This device can't manage credentials."
  }
  if (clientPin == '') {
    return "This device can't manage credentials."
  }
  if (clientPin == 'false') {
    return 'You need to set a PIN before you can manage credentials.'
  }
  return ''
}
