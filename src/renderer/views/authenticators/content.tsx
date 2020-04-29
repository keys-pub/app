import * as React from 'react'

import {Box, Button, Divider, Snackbar, SnackbarContent, TextField, Typography} from '@material-ui/core'

import {styles} from '../../components'
import {dateString} from '../helper'

import SetPinDialog from './pin'
import ResetDialog from './reset'

import Alert from '@material-ui/lab/Alert'

import {deviceInfo, relyingParties} from '../../rpc/fido2'
import {
  RPCError,
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
  info: DeviceInfo
  loading: boolean
  error: string
  openReset: boolean
  openSetPin: boolean
  openSnack: string
  rps: Array<RelyingParty>
}

export default class DeviceContentView extends React.Component<Props, State> {
  state = {
    loading: false,
    error: '',
    info: null,
    openReset: false,
    openSetPin: false,
    openSnack: '',
    rps: [],
  }

  componentDidMount() {
    this.info()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.device != prevProps.device) {
      this.info()
    }
  }

  info = () => {
    if (!this.props.device) {
      this.setState({info: null, error: '', loading: false})
      return
    }

    this.setState({loading: true, error: ''})
    const req: DeviceInfoRequest = {
      device: this.props.device.path,
    }
    deviceInfo(req, (err: RPCError, resp: DeviceInfoResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({
        info: resp.info,
        loading: false,
      })
    })
  }

  rps = () => {
    if (!this.props.device) {
      this.setState({info: null, error: '', loading: false})
      return
    }

    this.setState({loading: true, error: ''})
    const req: RelyingPartiesRequest = {
      device: this.props.device.path,
    }
    relyingParties(req, (err: RPCError, resp: RelyingPartiesResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({
        rps: resp.parties,
        loading: false,
      })
    })
  }

  closePin = (snack: string) => {
    this.setState({openSetPin: false, openSnack: snack})
    this.info()
  }

  closeReset = (snack: string) => {
    this.setState({openReset: false, openSnack: snack})
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

  renderInfo() {
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
        <Typography style={valueStyle}>{toHex(this.state.info?.aaguid)}</Typography>

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
          >
            Set PIN
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

  render() {
    if (!this.props.device) return null

    return (
      <Box display="flex" flexDirection="column" flex={1}>
        {/* {this.renderActions()}
        <Divider /> */}

        <Box
          display="flex"
          flexDirection="column"
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 45px)',
          }}
        >
          <Box style={{paddingTop: 10, marginLeft: 18, paddingRight: 10}}>{this.renderDevice()}</Box>

          <Box style={{paddingTop: 10, marginLeft: 18, paddingRight: 10}}>{this.renderActions()}</Box>

          <Box style={{paddingTop: 10, marginLeft: 18, paddingRight: 10}}>{this.renderInfo()}</Box>
        </Box>
        <SetPinDialog open={this.state.openSetPin} device={this.props.device} close={this.closePin} />
        <ResetDialog open={this.state.openReset} device={this.props.device} close={this.closeReset} />
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
