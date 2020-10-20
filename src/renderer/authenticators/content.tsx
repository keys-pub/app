import * as React from 'react'

import {Box, Button, Divider, Tabs, Tab, TextField, Typography} from '@material-ui/core'

import Info from './info'
import Credentials from './credentials'

import {Device} from '@keys-pub/tsclient/lib/fido2'

type Props = {
  device: Device
}

type State = {
  tab: number
  loading: boolean
  error: string
}

export default class DeviceContentView extends React.Component<Props, State> {
  state = {
    tab: 0,
    loading: false,
    error: '',
  }

  tabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({tab: newValue})
  }

  render() {
    return (
      <Box style={{width: '100%', position: 'relative'}}>
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

        <Box style={{position: 'absolute', left: 0, top: 40, right: 0, bottom: 0, overflowY: 'auto'}}>
          {this.state.tab == 0 && <Info device={this.props.device} />}
          {this.state.tab == 1 && <Credentials device={this.props.device} />}
        </Box>
      </Box>
    )
  }
}
