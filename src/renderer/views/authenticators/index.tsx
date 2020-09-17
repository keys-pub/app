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

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Publish as ExportIcon,
  DataUsage as GenerateKeyIcon,
  ArrowDownward as ImportKeyIcon,
  Search as SearchIcon,
} from '@material-ui/icons'

import Header from '../header'
import {pluralize} from '../helper'

import DeviceContentView from './content'

import {devices} from '../../rpc/fido2'
import {Device, DevicesRequest, DevicesResponse} from '../../rpc/fido2.d'
import {Error} from '../store'

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
      const resp = await devices({})
      const selected = resp.devices?.find((d: Device) => d.path == this.state.selected?.path)
      this.setState({
        devices: resp.devices || [],
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
        flex={1}
        style={{paddingLeft: 8, paddingTop: 4, paddingBottom: 6, height: 30}}
      >
        <Typography style={{marginRight: 10, paddingLeft: 8, width: '100%', paddingTop: 6, color: '#999'}}>
          {pluralize(this.state.devices?.length, 'Device', 'Devices')}
        </Typography>
        <Button
          color="primary"
          variant="outlined"
          size="small"
          onClick={this.refresh}
          style={{marginTop: 2, marginRight: 10}}
          // startIcon={<AddIcon />}
        >
          Refresh
        </Button>
      </Box>
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Box display="flex" flexDirection="row" flex={1} style={{height: '100%', position: 'relative'}}>
          <Box style={{width: 200}}>
            {this.renderHeader()}
            <Divider />
            <Box style={{position: 'absolute', width: 200, left: 0, top: 41, bottom: 0, overflowY: 'auto'}}>
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
          <Divider orientation="vertical" />
          <Box display="flex" flex={1}>
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
