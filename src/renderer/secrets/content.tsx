import * as React from 'react'

import {Box, Button, Divider, IconButton, TextField, Tooltip, Typography} from '@material-ui/core'

import {PasswordVisibleIcon, EditIcon, AddIcon} from '../icons'

import {mono, breakWords} from '../theme'
import {dateString} from '../helper'

import PasswordOptions from './pw'

import {Secret, SecretType} from '@keys-pub/tsclient/lib/keys.d'

type Props = {
  secret?: Secret
  edit: () => void
}

type State = {
  passwordVisible: boolean
}

export default class SecretContentView extends React.Component<Props, State> {
  state = {
    passwordVisible: false,
  }

  renderActions() {
    return (
      <Box display="flex" flexDirection="row">
        {this.props.secret && (
          <Box display="flex" flexDirection="row">
            <IconButton size="small" onClick={this.props.edit}>
              <Tooltip title="Edit">
                <EditIcon />
              </Tooltip>
            </IconButton>
          </Box>
        )}
      </Box>
    )
  }

  renderPassword(secret: Secret) {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography style={labelStyle}>Name</Typography>
        <Typography style={valueStyle}>{secret.name || ' '}</Typography>

        <Typography style={labelStyle}>Username</Typography>
        <Typography style={valueStyle}>{secret.username || ' '}</Typography>

        <Typography style={labelStyle}>Password</Typography>
        <Box display="flex" flexDirection="row" style={{position: 'relative'}}>
          {!this.state.passwordVisible && (
            <Typography variant="body2" style={valueStyle}>
              {secret.password ? '•'.repeat(12) : ' '}
            </Typography>
          )}
          {this.state.passwordVisible && (
            <Typography variant="body2" style={valueStyle}>
              {secret.password || ' '}
            </Typography>
          )}
          <Box style={{position: 'absolute', right: 10, top: -15}}>
            <PasswordOptions
              password={secret?.password || ''}
              visible={this.state.passwordVisible}
              setVisible={(visible: boolean) => this.setState({passwordVisible: visible})}
            />
          </Box>
        </Box>

        <Typography style={labelStyle}>URL</Typography>
        <Typography style={valueStyle}>{secret.url || ' '}</Typography>

        <Typography style={labelStyle}>Notes</Typography>
        <Typography style={valueStyle}>{secret.notes || ' '}</Typography>
      </Box>
    )
  }

  renderNote(secret: Secret) {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography style={labelStyle}>Name</Typography>
        <Typography style={valueStyle}>{secret.name || ' '}</Typography>

        <Typography style={labelStyle}>Notes</Typography>
        <Typography style={valueStyle}>{secret.notes || ' '}</Typography>
      </Box>
    )
  }

  renderSecret(secret: Secret) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        style={{position: 'absolute', top: 67, left: 14, bottom: 0, right: 0}}
      >
        {secret.type == SecretType.PASSWORD_SECRET && this.renderPassword(secret)}
        {secret.type == SecretType.NOTE_SECRET && this.renderNote(secret)}

        <Box display="flex" flexDirection="row">
          <Typography style={{...dateLabelStyle}}>Created:&nbsp;</Typography>
          <Typography style={dateValueStyle}>{dateString(secret.createdAt)}</Typography>
        </Box>
        <Box display="flex" flexDirection="row" marginBottom={1}>
          <Typography style={{...dateLabelStyle}}>Updated:&nbsp;</Typography>
          <Typography style={dateValueStyle}>{dateString(secret.updatedAt)}</Typography>
        </Box>
      </Box>
    )
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
        <Box
          display="flex"
          flexDirection="column"
          flex={1}
          style={{
            position: 'absolute',
            top: 27,
            right: 0,
            left: 10,
          }}
        >
          {this.renderActions()}
        </Box>
        {this.props.secret && this.renderSecret(this.props.secret)}
      </Box>
    )
  }
}

const labelStyle = {
  ...breakWords,
  transform: 'scale(0.75)',
  transformOrigin: 'top left',
  color: 'rgba(0, 0, 0, 0.54)',
  marginTop: -1,
  paddingBottom: 2,
  fontSize: '0.857rem',
  height: 20,
}
const valueStyle = {...breakWords, paddingBottom: 24, height: 20}

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
