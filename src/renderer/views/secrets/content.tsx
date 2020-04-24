import * as React from 'react'

import {Box, Button, Divider, Snackbar, SnackbarContent, TextField, Typography} from '@material-ui/core'

import {Visibility as PasswordVisibleIcon} from '@material-ui/icons'

import {styles} from '../../components'
import {dateString} from '../helper'

import PasswordOptions from './pw'

import {RPCError, Secret, SecretType} from '../../rpc/keys.d'

type Props = {
  secret: Secret
  edit: () => void
}

type State = {
  passwordVisible: boolean
  copySnackOpen: boolean
}

export default class SecretContentView extends React.Component<Props, State> {
  state = {
    passwordVisible: false,
    copySnackOpen: false,
  }

  renderActions() {
    return (
      <Box
        display="flex"
        flexDirection="row"
        style={{paddingLeft: 8, paddingTop: 6, paddingBottom: 8, height: 34}}
      >
        <Button
          onClick={this.props.edit}
          variant="outlined"
          size="small"
          style={{marginTop: 2, width: 55, marginRight: 10}}
        >
          Edit
        </Button>
        <Box display="flex" flexGrow={1} />
      </Box>
    )
  }

  renderPassword() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography style={labelStyle}>Name</Typography>
        <Typography style={valueStyle}>{this.props.secret.name || ' '}</Typography>

        <Typography style={labelStyle}>Username</Typography>
        <Typography style={valueStyle}>{this.props.secret.username || ' '}</Typography>

        <Typography style={labelStyle}>Password</Typography>
        <Box display="flex" flexDirection="row" style={{position: 'relative'}}>
          {!this.state.passwordVisible && (
            <Typography style={valueStyle}>{this.props.secret.password ? '•'.repeat(12) : ' '}</Typography>
          )}
          {this.state.passwordVisible && (
            <Typography style={valueStyle}>{this.props.secret.password || ' '}</Typography>
          )}
          <Box style={{position: 'absolute', right: 10, top: -22}}>
            <PasswordOptions
              password={this.props.secret.password}
              visible={this.state.passwordVisible}
              setVisible={(visible: boolean) => this.setState({passwordVisible: visible})}
            />
          </Box>
        </Box>

        <Typography style={labelStyle}>URL</Typography>
        <Typography style={valueStyle}>{this.props.secret.url || ' '}</Typography>

        <Typography style={labelStyle}>Notes</Typography>
        <Typography style={valueStyle}>{this.props.secret.notes || ' '}</Typography>
      </Box>
    )
  }

  renderNote() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography style={labelStyle}>Name</Typography>
        <Typography style={valueStyle}>{this.props.secret.name || ' '}</Typography>

        <Typography style={labelStyle}>Notes</Typography>
        <Typography style={valueStyle}>{this.props.secret.notes || ' '}</Typography>
      </Box>
    )
  }

  render() {
    if (!this.props.secret) return null

    return (
      <Box display="flex" flexDirection="column" flex={1}>
        {this.renderActions()}
        <Divider />

        <Box
          display="flex"
          flexDirection="column"
          style={{overflowY: 'auto', height: 'calc(100vh - 94px)', paddingTop: 10, marginLeft: 18}}
        >
          {this.props.secret.type == SecretType.PASSWORD_SECRET && this.renderPassword()}
          {this.props.secret.type == SecretType.NOTE_SECRET && this.renderNote()}

          <Box display="flex" flexDirection="row">
            <Typography style={{...dateLabelStyle}}>Created:&nbsp;</Typography>
            <Typography style={dateValueStyle}>{dateString(this.props.secret.createdAt)}</Typography>
          </Box>
          <Box display="flex" flexDirection="row" marginBottom={1}>
            <Typography style={{...dateLabelStyle}}>Updated:&nbsp;</Typography>
            <Typography style={dateValueStyle}>{dateString(this.props.secret.updatedAt)}</Typography>
          </Box>
        </Box>
      </Box>
    )
  }
}

const labelStyle = {
  ...styles.breakWords,
  transform: 'scale(0.75)',
  transformOrigin: 'top left',
  color: 'rgba(0, 0, 0, 0.54)',
  marginTop: -1,
  paddingBottom: 2,
  fontSize: '0.857rem',
}
const valueStyle = {...styles.mono, ...styles.breakWords, paddingBottom: 24}

const dateLabelStyle = {
  color: 'rgba(0, 0, 0, 0.5)',
  display: 'inline',
  fontSize: '0.7rem',
  paddingBottom: 4,
  // fontWeight: 600,
  width: 60,
}

const dateValueStyle = {
  color: 'rgba(0, 0, 0, 0.5)',
  display: 'inline',
  fontSize: '0.7rem',
}

const secretTypeLabel = (t: SecretType) => {
  switch (t) {
    case SecretType.PASSWORD_SECRET:
      return 'Password'
    case SecretType.CONTACT_SECRET:
      return 'Contact'
    case SecretType.CARD_SECRET:
      return 'Card'
    case SecretType.NOTE_SECRET:
      return 'Notes'
    default:
      return '?'
  }
}
