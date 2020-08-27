import * as React from 'react'

import {Box, Button, Divider, TextField, Typography} from '@material-ui/core'

import {styles} from '../../components'
import Snack, {SnackProps} from '../../components/snack'
import {dateString} from '../helper'

import SetPinDialog from './setpin'
import ResetDialog from './reset'

import {deviceInfo, relyingParties} from '../../rpc/fido2'
import {
  Device,
  DeviceInfo,
  Option,
  DeviceInfoRequest,
  DeviceInfoResponse,
  RelyingParty,
  RelyingPartiesRequest,
  RelyingPartiesResponse,
} from '../../rpc/fido2.d'
import {toHex} from '../helper'

import RelyingParties from './rps'

type Props = {
  device: Device
}

type State = {
  clientPin: string
  info?: DeviceInfo
  loading: boolean
  error?: Error
  openReset: boolean
  openSetPin: boolean
  snack?: SnackProps
  snackOpen: boolean
}

export default class DeviceInfoView extends React.Component<Props, State> {
  state: State = {
    loading: false,
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

  info = () => {
    if (!this.props.device) {
      this.setState({info: undefined, error: undefined, loading: false})
      return
    }

    this.setState({loading: true, error: undefined})
    const req: DeviceInfoRequest = {
      device: this.props.device.path,
    }
    deviceInfo(req)
      .then((resp: DeviceInfoResponse) => {
        let clientPin = ''
        const optClientPin = (resp.info?.options || []).find((opt: Option) => {
          return opt.name == 'clientPin'
        })
        if (optClientPin) {
          clientPin = optClientPin.value || ''
        }

        this.setState({
          info: resp.info,
          loading: false,
          clientPin,
        })
      })
      .catch((err: Error) => {
        this.setState({loading: false, error: err})
      })
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
        <Typography style={valueStyle}>{this.props.device.path || ' '}</Typography>
      </Box>
    )
  }

  renderDetails() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={labelStyle}>Versions</Typography>
        <Typography style={valueStyle}>
          {this.state.info?.versions?.map((v: string, index) => (
            <span key={v}>
              {v}
              <br />
            </span>
          ))}
        </Typography>

        <Typography style={labelStyle}>Extensions</Typography>
        <Typography style={valueStyle}>
          {this.state.info?.extensions?.map((e: string, index) => (
            <span key={e}>
              {e}
              <br />
            </span>
          ))}
        </Typography>

        <Typography style={labelStyle}>AAGUID</Typography>
        <Typography style={valueStyle}>{this.state.info?.aaguid}</Typography>

        <Typography style={labelStyle}>Options</Typography>
        <Typography style={valueStyle}>
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
            {this.state.clientPin == 'false' ? 'Create PIN' : 'Change PIN'}
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
          create={this.state.clientPin == 'false'}
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
        {!this.state.error && this.renderInfo()}

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
  ...styles.breakWords,
  transform: 'scale(0.75)',
  transformOrigin: 'top left',
  color: 'rgba(0, 0, 0, 0.54)',
  marginTop: -1,
  paddingBottom: 2,
  fontSize: '0.857rem',
}
const valueStyle = {...styles.mono, ...styles.breakWords, paddingBottom: 16}
