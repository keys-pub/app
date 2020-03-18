// @flow
import * as React from 'react'

import {
  Box,
  Button,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import Step from '../../components/step'

import {push, goBack} from 'connected-react-router'
import {connect} from 'react-redux'

import {Inbox} from '../../rpc/types'

type Props = {
  inbox: Inbox
  dispatch: (action: any) => any
}

class InboxLeave extends React.Component<Props> {
  leave = () => {
    if (!this.props.inbox) return
    /*
    const req: GroupLeaveRequest = {id: this.props.group.id}
    this.props.dispatch(
      groupLeave(req, (resp: GroupLeaveResponse) => {
        this.props.dispatch(push('/inbox'))
      })
    )
    */
  }

  render() {
    if (!this.props.inbox) return null

    let name = this.props.inbox.name
    return (
      <Step title="Archive" next={{label: 'Yes, Leave', action: this.leave}}>
        <Typography variant="body1" style={{paddingBottom: 40}}>
          Are you sure you want to leave {name}? If you are the only person with the passphrase, this group
          will be lost forever.
        </Typography>
      </Step>
    )
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  return {}
}

export default connect(mapStateToProps)(InboxLeave)
