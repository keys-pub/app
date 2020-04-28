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

import {styles} from '../../components'

import DeviceContentView from './content'

import {devices} from '../../rpc/fido2'
import {RPCError, Device, DevicesRequest, DevicesResponse} from '../../rpc/fido2.d'
import {AppState} from '../../reducers/app'

type Props = {}

type Position = {
  x: number
  y: number
}

type State = {
  contextPosition: Position
  devices: Array<Device>
  input: string
  selected: Device
}

export default class AuthenticatorsView extends React.Component<Props, State> {
  state = {
    contextPosition: null,
    devices: [],
    input: '',
    selected: null,
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.list('')
  }

  list = (query: string) => {
    const selected = this.state.devices.find((d: Device) => d.path == this.state.selected?.path)

    console.log('List devices')
    const req: DevicesRequest = {}
    devices(req, (err: RPCError, resp: DevicesResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({
        devices: resp.devices,
        selected: selected,
      })
    })
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

  onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.preventDefault()
    // const path = event.currentTarget.id
    // const device = this.state.devices.find((d: Device) => d.path == path)
    // this.setState({
    //   contextPosition: {x: event.clientX - 2, y: event.clientY - 4},
    //   selected: device,
    // })
  }

  closeContext = () => {
    this.setState({contextPosition: null, selected: null})
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      input: target.value,
    })
    this.list(target.value)
  }

  renderHeader() {
    return (
      <Box
        display="flex"
        flexDirection="row"
        flex={1}
        style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 8, height: 34}}
      >
        <TextField
          placeholder="Filter"
          variant="outlined"
          value={this.state.input}
          onChange={this.onInputChange}
          inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
          style={{marginTop: 2, marginRight: 10}}
        />
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
      <Box>
        <Menu
          keepMounted
          open={this.state.contextPosition !== null}
          onClose={this.closeContext}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.contextPosition !== null
              ? {top: this.state.contextPosition.y, left: this.state.contextPosition.x}
              : undefined
          }
        >
          <MenuItem onClick={() => {}}>
            <ExportIcon />
            <Typography style={{marginLeft: 10, marginRight: 20}}>TODO</Typography>
          </MenuItem>
        </Menu>
        <Divider />
        <Box display="flex" flexDirection="row" flex={1} style={{height: '100%'}}>
          <Box style={{width: 200}}>
            {this.renderHeader()}
            <Divider />
            <Box style={{height: 'calc(100vh - 88px)', overflowY: 'auto'}}>
              <Table size="small">
                <TableBody>
                  {this.state.devices.map((device, index) => {
                    return (
                      <TableRow
                        hover
                        onClick={(event) => this.select(device)}
                        key={device.path}
                        style={{cursor: 'pointer'}}
                        selected={this.isSelected(device)}
                        component={(props: any) => {
                          return <tr onContextMenu={this.onContextMenu} {...props} id={device.path} />
                        }}
                      >
                        <TableCell component="th" scope="row" style={{minWidth: 150, verticalAlign: 'top'}}>
                          <Typography
                            style={{
                              ...nowrapStyle,
                              whiteSpace: 'nowrap',
                              fontSize: '1.1em',
                              paddingBottom: 2,
                            }}
                          >
                            {device.product}
                          </Typography>
                          <Typography
                            style={{...nowrapStyle, ...styles.mono, whiteSpace: 'nowrap', color: '#777777'}}
                          >
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
            <DeviceContentView device={this.state.selected} />
          </Box>
        </Box>
      </Box>
    )
  }
}

const nowrapStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  width: 145,
}
