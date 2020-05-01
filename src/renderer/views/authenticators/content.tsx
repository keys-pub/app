import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  Snackbar,
  SnackbarContent,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import {Device} from '../../rpc/fido2.d'
import {toHex} from '../helper'

import Info from './info'
import Credentials from './credentials'

type Props = {
  device: Device
}

type State = {
  tab: number
  loading: boolean
  error: string
  openSnack: string
}

export default class DeviceContentView extends React.Component<Props, State> {
  state = {
    tab: 0,
    loading: false,
    error: '',
    openSnack: '',
  }

  tabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({tab: newValue})
  }

  render() {
    if (!this.props.device) return null

    return (
      <Box style={{width: '100%'}}>
        <Tabs
          value={this.state.tab}
          centered={true}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.tabChange}
        >
          <Tab label="info" />
          <Tab label="credentials" />
        </Tabs>

        <Box style={{height: 'calc(100vh - 76px)', overflowY: 'auto'}}>
          {this.state.tab == 0 && <Info device={this.props.device} />}
          {this.state.tab == 1 && <Credentials device={this.props.device} />}
        </Box>

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
