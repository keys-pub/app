import * as React from 'react'

import {Box, Button, Divider, TextField, Typography} from '@material-ui/core'

import Snack, {SnackProps} from '../components/snack'
import {dateString} from '../helper'

import SetPinDialog from './setpin'
import ResetDialog from './reset'
import {breakWords, mono} from '../theme'

import {deviceInfo, deviceType, relyingParties} from '../rpc/fido2'
import {
  Device,
  DeviceType,
  DeviceInfo,
  Option,
  DeviceInfoRequest,
  DeviceInfoResponse,
  RelyingParty,
  RelyingPartiesRequest,
  RelyingPartiesResponse,
} from '../rpc/fido2.d'
import {toHex} from '../helper'

import RelyingParties from './rps'

type Props = {
  device: Device
}

type State = {
  clientPin: string
  info?: DeviceInfo
  loading: boolean
  unsupported: boolean
  error?: Error
  openReset: boolean
  openSetPin: boolean
  snack?: SnackProps
  snackOpen: boolean
}

export default class DeviceInfoView extends React.Component<Props, State> {
  state: State = {
    loading: false,
    unsupported: false,
    openReset: false,
    openSetPin: false,
    clientPin: '',
    snackOpen: false,
  }

  componentDidMount() {
    this.info()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.device != prevProps.device) {
      this.info()
    }
  }

  info = async () => {
    if (!this.props.device) {
      this.setState({info: undefined, error: undefined, loading: false, unsupported: false})
      return
    }

    this.setState({info: undefined, loading: true, error: undefined, unsupported: false})
    try {
      const devt = await deviceType({
        device: this.props.device.path,
      })
      if (devt.type != DeviceType.FIDO2) {
        this.setState({
          loading: false,
          unsupported: true,
        })
        return
      }

      const dev = await deviceInfo({
        device: this.props.device.path,
      })
      let clientPin = ''
      const optClientPin = (dev.info?.options || []).find((opt: Option) => {
        return opt.name == 'clientPin'
      })
      if (optClientPin) {
        clientPin = optClientPin.value || ''
      }

      this.setState({
        info: dev.info,
        loading: false,
        clientPin,
      })
    } catch (err) {
      this.setState({loading: false, error: err})
    }
  }

  closePin = (snack: string) => {
    this.setState({
      openSetPin: false,
      snack: {message: snack, alert: 'success', duration: 4000},
      snackOpen: !!snack,
    })
    this.info()
  }

  closeReset = (snack: string) => {
    this.setState({
      openReset: false,
      snack: {message: snack, alert: 'success', duration: 4000},
      snackOpen: !!snack,
    })
    this.info()
  }

  renderDevice() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={labelStyle}>Product</Typography>
        <Typography style={valueStyle}>{this.props.device.product || ' '}</Typography>
        {/* <Typography style={{...valueStyle, color: '#999'}}>({this.props.device.productId})</Typography> */}

        <Typography style={labelStyle}>Manufacturer</Typography>
        <Typography style={valueStyle}>{this.props.device.manufacturer || ' '}</Typography>
        {/* ({this.props.device.vendorId}) */}

        <Typography style={labelStyle}>Path</Typography>
        <Typography style={{...valueStyle, ...mono}}>{this.props.device.path || ' '}</Typography>
      </Box>
    )
  }

  renderDetails() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={labelStyle}>Versions</Typography>
        <Typography style={{...valueStyle, ...mono}}>
          {this.state.info?.versions?.map((v: string, index) => (
            <span key={v}>
              {v}
              <br />
            </span>
          ))}
        </Typography>

        <Typography style={labelStyle}>Extensions</Typography>
        <Typography style={{...valueStyle, ...mono}}>
          {this.state.info?.extensions?.map((e: string, index) => (
            <span key={e}>
              {e}
              <br />
            </span>
          ))}
        </Typography>

        <Typography style={labelStyle}>AAGUID</Typography>
        <Typography style={{...valueStyle, ...mono}}>{this.state.info?.aaguid}</Typography>

        <Typography style={labelStyle}>Options</Typography>
        <Typography style={{...valueStyle, ...mono}}>
          {this.state.info?.options?.map((option: Option, index) => (
            <span key={option.name}>
              {option.name}: {option.value}
              <br />
            </span>
          ))}
        </Typography>
      </Box>
    )
  }

  renderActions() {
    return (
      <Box display="flex" flexDirection="column" marginBottom={2}>
        <Typography style={labelStyle}>Actions</Typography>
        <Box display="flex" flexDirection="row">
          <Button
            color="primary"
            variant="outlined"
            size="small"
            style={{marginRight: 10}}
            onClick={() => this.setState({openSetPin: true})}
            disabled={this.state.clientPin == ''}
          >
            {this.state.clientPin == 'FALSE' ? 'Create PIN' : 'Change PIN'}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            size="small"
            style={{marginRight: 10}}
            onClick={() => this.setState({openReset: true})}
          >
            Reset
          </Button>
        </Box>
      </Box>
    )
  }

  renderError() {
    return (
      <Box marginLeft={2} marginTop={2}>
        <Typography style={{color: 'red'}}>{this.state.error?.message}</Typography>
      </Box>
    )
  }

  renderInfo() {
    return (
      <Box>
        <Box display="flex" flexDirection="column">
          <Box style={{paddingTop: 10, marginLeft: 18, paddingRight: 10}}>{this.renderDevice()}</Box>

          <Box style={{paddingTop: 10, marginLeft: 18, paddingRight: 10}}>{this.renderActions()}</Box>

          <Box style={{paddingTop: 10, marginLeft: 18, paddingRight: 10}}>{this.renderDetails()}</Box>
        </Box>
        <SetPinDialog
          open={this.state.openSetPin}
          create={this.state.clientPin == 'FALSE'}
          device={this.props.device}
          close={this.closePin}
        />
        <ResetDialog open={this.state.openReset} device={this.props.device} close={this.closeReset} />
      </Box>
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        {/* {this.renderActions()}
        <Divider /> */}

        {this.state.error && this.renderError()}

        {this.state.unsupported && (
          <Box display="flex" flexDirection="column" flex={1} alignItems="center" style={{marginTop: 20}}>
            <Typography>This is not a FIDO2 device.</Typography>
          </Box>
        )}

        {!this.state.loading &&
          !this.state.error &&
          !this.state.unsupported &&
          this.state.info &&
          this.renderInfo()}

        <Snack
          open={this.state.snackOpen}
          {...this.state.snack}
          onClose={() => this.setState({snackOpen: false})}
        />
      </Box>
    )
  }
}

const labelStyle = {
  ...breakWords,
  transform: 'scale(0.75)',
  transformOrigin: 'top left',
  color: 'rgba(0, 0, 0, 0.54)',
  marginTop: -1,
  paddingBottom: 2,
  fontSize: '0.857rem',
}
const valueStyle = {...breakWords, paddingBottom: 16}
