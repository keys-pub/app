import * as React from 'react'

import {Box, Button, IconButton, Typography} from '@material-ui/core'
import {Close} from '@material-ui/icons'

import {goBack, push} from 'connected-react-router'

import {connect} from 'react-redux'

import {RowHoriz, RowHorizComp} from './details'

import {selectedInbox} from './actions'

import {Inbox} from '../../rpc/types'

type Props = {
  inbox: Inbox | void
  dispatch: (action: any) => any
}

class InboxInfo extends React.Component<Props> {
  render() {
    if (!this.props.inbox) return null

    const {name, kid, createdAt, messageCount} = this.props.inbox

    const createdAtJSON = new Date(createdAt).toJSON()
    return (
      <Box display="flex" flex={1} justifyContent="center" alignItems="center">
        <Box style={{width: 700}}>
          <Box style={{marginTop: 20}} />

          {RowHoriz('Name', name)}
          {RowHoriz('KID', kid)}
          {RowHoriz('Created At', createdAtJSON)}
          {RowHoriz('# Messages', messageCount + '')}
          {RowHorizComp(
            ' ',
            <Button color="secondary" variant="outlined" size="small" onClick={() => {}}>
              ?
            </Button>
          )}

          <IconButton
            onClick={() => this.props.dispatch(goBack())}
            color="secondary"
            style={{right: 0, top: -30, position: 'absolute'}}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  const inbox = selectedInbox(state.rpc, state.app.selectedInbox)
  return {inbox}
}

export default connect(mapStateToProps)(InboxInfo)
