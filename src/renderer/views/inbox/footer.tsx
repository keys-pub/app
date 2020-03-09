import * as React from 'react'

import {Box, Button, IconButton, Menu, MenuItem, Typography} from '@material-ui/core'
import {AddCircle} from '@material-ui/icons'

import {connect} from 'react-redux'

import {push} from 'connected-react-router'

import {WatchStatus} from '../../rpc/types'
import {AppState} from '../../reducers/app'

type Props = {
  watchStatus: WatchStatus
  dispatch: (action: any) => any
}

class Footer extends React.Component<Props> {
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

const mapStateToProps = (state: {app: AppState}) => {
  return {
    watchStatus: state.app.watchStatus,
  }
}

export default connect(mapStateToProps)(Footer)
