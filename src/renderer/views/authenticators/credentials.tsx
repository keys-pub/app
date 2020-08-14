import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core'

import {pluralize} from '../helper'

import {credentials, deviceInfo, relyingParties, retryCount} from '../../rpc/fido2'
import {
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
import {stringify} from 'querystring'

type Props = {
  device: Device
}

interface Error {
  code: number
  message: string
}

type State = {
  clientPin: string
  credMgmt: string
  loading: boolean
  error?: Error
  pin: string
  pinInput: string
  credentials: Array<Credential>
  step: string
  retryCount: number
}

export default class DeviceCredentialsView extends React.Component<Props, State> {
  state: State = {
    loading: false,
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.device != prevProps.device) {
      this.clear()
      this.info()
    }
  }

  clear = () => {
    this.setState({pinInput: '', pin: '', error: undefined, credentials: [], step: ''})
  }

  info = () => {
    if (!this.props.device) {
      return
    }

    this.setState({loading: true, error: undefined})
    const req: DeviceInfoRequest = {
      device: this.props.device.path,
    }
    deviceInfo(req)
      .then((resp: DeviceInfoResponse) => {
        let clientPin = ''
        const optClientPin = resp.info?.options?.find((opt: Option) => opt.name == 'clientPin')
        if (optClientPin) {
          clientPin = optClientPin.value || ''
        }
        let credMgmt = ''
        const optCredMgmt = resp.info?.options?.find((opt: Option) => opt.name == 'credMgmt')
        if (optCredMgmt) {
          credMgmt = optCredMgmt.value || ''
        }

        this.setState({
          loading: false,
          clientPin,
          credMgmt,
          step: 'pin',
        })
      })
      .catch((err: Error) => {
        this.setState({error: err, step: ''})
      })
      .finally(() => {
        this.setState({loading: false})
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
      rpId: '',
    }
    credentials(req)
      .then((resp: CredentialsResponse) => {
        this.setState({
          step: 'credentials',
          credentials: resp.credentials || [],
        })
      })
      .catch((err: Error) => {
        this.setState({error: err, pin: '', step: 'pin', retryCount: -1})
        if (err.code == 3) {
          // Invalid pin
          this.pinRetryCount()
        }
        return
      })
      .finally(() => {
        this.setState({loading: false})
      })
  }

  pinRetryCount = () => {
    const req: RetryCountRequest = {
      device: this.props.device.path,
    }
    retryCount(req)
      .then((resp: RetryCountResponse) => {
        this.setState({
          retryCount: resp.count || 0,
        })
      })
      .catch((err: Error) => {
        this.setState({error: err, pin: '', step: 'pin'})
      })
      .finally(() => {
        this.setState({loading: false})
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
    this.setState({pinInput: target.value, error: undefined})
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
        {this.state.error && <Typography style={{color: 'red'}}>{this.state.error?.message}</Typography>}
        {this.state.error?.message == 'pin invalid' && this.state.retryCount >= 0 && (
          <Typography>You have {pluralize(this.state.retryCount, 'retry', 'retries')} left.</Typography>
        )}
      </Box>
    )
  }

  renderError() {
    return (
      <Box marginTop={2}>
        <Typography style={{color: 'red'}}>{this.state.error?.message}</Typography>
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
      </Box>
    )
  }
}

const credStatus = (credMgmt: string, clientPin: string) => {
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
