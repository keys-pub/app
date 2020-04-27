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
import UserLabel from '../user/label'
import {IDView} from '../key/content'

import {store} from '../../store'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import KeyCreateDialog from '../key/create'
import KeyImportDialog from '../import'
import KeyRemoveDialog from '../key/remove'
import KeyExportDialog from '../export'
import KeyDialog from '../key'
import SearchDialog from '../search/dialog'
import {directionString, flipDirection} from '../helper'

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
  selected: string
}

export default class AuthenticatorsView extends React.Component<Props, State> {
  state = {
    contextPosition: null,
    devices: [],
    selected: '',
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.list()
  }

  list = () => {
    console.log('List devices')
    const req: DevicesRequest = {}
    devices(req, (err: RPCError, resp: DevicesResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({
        devices: resp.devices,
      })
    })
  }

  onChange = () => {
    this.refresh()
  }

  select = (device: Device) => {
    this.setState({selected: device.path})
  }

  isSelected = (path: string): boolean => {
    return this.state.selected == path
  }

  onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const path = event.currentTarget.id
    this.setState({
      contextPosition: {x: event.clientX - 2, y: event.clientY - 4},
      selected: path,
    })
  }

  closeContext = () => {
    this.setState({contextPosition: null, selected: ''})
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
        <Box style={{height: 'calc(100vh - 84px)', overflowY: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography style={{...styles.mono}}>Product</Typography>
                </TableCell>
                <TableCell>
                  <Typography style={{...styles.mono}}>Path</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.devices.map((device, index) => {
                return (
                  <TableRow
                    hover
                    onClick={(event) => this.select(device.path)}
                    key={device.path}
                    style={{cursor: 'pointer'}}
                    selected={this.isSelected(device.path)}
                    component={(props: any) => {
                      return <tr onContextMenu={this.onContextMenu} {...props} id={device.path} />
                    }}
                  >
                    <TableCell component="th" scope="row" style={{minWidth: 200, verticalAlign: 'top'}}>
                      <Typography>
                        {device.product}
                        <br />
                        {device.manufacturer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography style={{...styles.breakWords}}>{device.path}</Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    )
  }
}
