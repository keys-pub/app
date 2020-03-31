import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, LinearProgress, Typography, Box} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import {Link, styles} from '../../components'
import {shell} from 'electron'

export const WelcomeStatus = (props: {}) => {
  return (
    <Alert severity="info">
      <Typography>
        A wormhole is an encrypted tunnel between 2 computers using these keys. For more info, see{' '}
        <Link span onClick={() => shell.openExternal('https://keys.pub/docs/specs/wormhole.html')}>
          keys.pub/docs/specs/wormhole
        </Link>
        .
      </Typography>
    </Alert>
  )
}

export const CanStartStatus = (props: {}) => {
  return (
    <Alert severity="info">
      <Typography>You're ready to start the wormhole on this side. Now hit start!</Typography>
    </Alert>
  )
}

export const ConnectingStatus = (props: {recipient: string}) => {
  return (
    <Alert severity="info">
      <Typography>
        We are trying to connect to {props.recipient}. They need to start the wormhole on their side.
      </Typography>
    </Alert>
  )
}

export const ConnectedStatus = (props: {}) => {
  return (
    <Alert severity="success">
      <Typography>You are connected!</Typography>
    </Alert>
  )
}

export const DisconnectedStatus = (props: {}) => {
  return (
    <Alert severity="error">
      <Typography>Disconnected.</Typography>
    </Alert>
  )
}

export const ErrorStatus = (props: {error: string}) => {
  return (
    <Alert severity="error">
      <Typography>
        There was an error:
        <br />
        <span style={{...styles.mono, ...styles.breakWords}}>{props.error}</span>
      </Typography>
    </Alert>
  )
}
