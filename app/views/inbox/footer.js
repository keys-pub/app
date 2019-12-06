// @flow
import React, {Component} from 'react'

import {Box, Button, IconButton, Menu, MenuItem, Typography} from '@material-ui/core'
import {AddCircle} from '@material-ui/icons'

import {connect} from 'react-redux'

import {push} from 'connected-react-router'

import type {AppState} from '../../reducers/app'
import type {WatchStatus} from '../../rpc/types'
import type {RPCState} from '../../rpc/rpc'

type Props = {
  watchStatus: WatchStatus,
  dispatch: (action: any) => any,
}

class Footer extends Component<Props> {
  render() {
    let watchStatus = this.props.watchStatus.toLowerCase()
    switch (watchStatus) {
      case 'no_status':
        watchStatus = ''
        break
      case 'starting':
      case 'data':
        watchStatus = 'connected'
        break
    }
    if (watchStatus === '') {
      return null
    }

    return (
      <Box style={{backgroundColor: '#282A30'}}>
        <Box display="flex" flex={1} flexDirection="row">
          <Box
            display="flex"
            flex={1}
            alignItems="center"
            style={{paddingTop: 7, paddingBottom: 7, minHeight: 35}}
          >
            <Box>
              <Typography style={{color: 'white'}}>{watchStatus}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {app: AppState, rpc: RPCState}) => {
  return {
    watchStatus: state.app.watchStatus,
  }
}

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(Footer)
