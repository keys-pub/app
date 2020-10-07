import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@material-ui/core'

import {RefreshIcon} from '../icons'

import DeviceContentView from './content'

import {devices as listDevices} from '../rpc/fido2'
import {Device, DevicesRequest, DevicesResponse} from '../rpc/fido2.d'
import {Error} from '../store'
import {contentTop, column2Color} from '../theme'

type Props = {}

type State = {
  devices: Device[]
  error?: Error
  input: string
  loading: boolean
  selected?: Device
}

export default class AuthenticatorsView extends React.Component<Props, State> {
  state: State = {
    devices: [],
    input: '',
    loading: false,
  }

  componentDidMount() {
    this.refresh()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props != prevProps) {
      this.refresh()
    }
  }

  refresh = () => {
    this.list()
  }

  list = async () => {
    this.setState({loading: true, error: undefined})
    try {
      const resp = await listDevices({})
      let selected = resp.devices?.find((d: Device) => d.path == this.state.selected?.path)
      const devices = resp.devices || []
      if (devices.length > 0 && !selected) {
        selected = devices[0]
      }
      this.setState({
        devices: devices,
        selected: selected,
        loading: false,
      })
    } catch (err) {
      if (err.code == 12) {
        err = {code: 12, message: "Sorry, this feature isn't currently available on your platform."}
      }
      this.setState({devices: [], loading: false, error: err})
    }
  }

  onChange = () => {
    this.refresh()
  }

  select = (device: Device) => {
    this.setState({selected: device})
  }

  isSelected = (device: Device): boolean => {
    return this.state.selected?.path == device?.path
  }

  renderHeader() {
    return (
      <Box
        display="flex"
        flexDirection="row"
        style={{paddingLeft: 8, paddingTop: contentTop}}
        alignItems="center"
      >
        <Typography variant="h6" style={{marginRight: 10, paddingLeft: 8, width: '100%'}}>
          Devices
        </Typography>
        <IconButton color="primary" size="small" onClick={this.refresh}>
          <RefreshIcon />
        </IconButton>
      </Box>
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Box display="flex" flexDirection="row" flex={1} style={{height: '100%', position: 'relative'}}>
          <Box display="flex" flexDirection="column" style={{width: 200}}>
            {this.renderHeader()}
            <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
              <Box
                style={{
                  position: 'absolute',
                  width: 200,
                  left: 0,
                  top: 0,
                  bottom: 0,
                  overflowX: 'hidden',
                  overflowY: 'auto',
                  backgroundColor: column2Color,
                }}
              >
                <Table size="small">
                  <TableBody>
                    {this.state.devices.map((device, index) => {
                      return (
                        <TableRow
                          hover
                          onClick={() => this.select(device)}
                          key={device.path}
                          style={{cursor: 'pointer'}}
                          selected={this.isSelected(device)}
                          component={(props: any) => {
                            return <tr {...props} id={device.path} />
                          }}
                        >
                          <TableCell component="th" scope="row" style={{verticalAlign: 'top'}}>
                            <Typography
                              noWrap
                              style={{
                                ...nowrapStyle,
                                paddingBottom: 2,
                              }}
                            >
                              {device.product}
                            </Typography>
                            <Typography noWrap style={{...nowrapStyle, color: '#777777'}}>
                              {device.manufacturer}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
          <Box display="flex" flex={1} style={{paddingTop: 12}}>
            {this.state.error?.message && (
              <Box display="flex" flex={1}>
                <Typography
                  align="center"
                  style={{color: 'red', width: '100%', paddingTop: 10, paddingBottom: 20}}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            {!this.state.error && this.state.selected && <DeviceContentView device={this.state.selected} />}
          </Box>
        </Box>
      </Box>
    )
  }
}

const nowrapStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  width: 166,
}
