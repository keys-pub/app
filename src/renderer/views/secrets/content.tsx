import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  LinearProgress,
  FormControl,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {Visibility as PasswordVisibleIcon} from '@material-ui/icons'

import Alert from '@material-ui/lab/Alert'

import {styles, DialogTitle} from '../../components'

import {clipboard} from 'electron'

import {RPCError, Secret, SecretSaveRequest, SecretSaveResponse, SecretType} from '../../rpc/types'
import {secretSave} from '../../rpc/rpc'

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
          <Typography style={labelStyle}>Name</Typography>
          <Typography style={valueStyle}>{this.props.secret.name || ' '}</Typography>

          <Typography style={labelStyle}>Username</Typography>
          <Typography style={valueStyle}>{this.props.secret.username || ' '}</Typography>

          <Typography style={labelStyle}>Password</Typography>
          <Box display="flex" flexDirection="row">
            {!this.state.passwordVisible && (
              <Typography style={valueStyle}>{this.props.secret.password ? '•'.repeat(12) : ' '}</Typography>
            )}
            {this.state.passwordVisible && (
              <Typography style={valueStyle}>{this.props.secret.password || ' '}</Typography>
            )}
            <Box display="flex" flexGrow={1} />
            <PasswordOptions
              password={this.props.secret.password}
              visible={this.state.passwordVisible}
              setVisible={(visible: boolean) => this.setState({passwordVisible: visible})}
            />
          </Box>
          <Box style={{marginBottom: 3}} />

          <Typography style={labelStyle}>URL</Typography>
          <Typography style={valueStyle}>{this.props.secret.url || ' '}</Typography>

          <Box style={{marginBottom: 3}} />

          <Typography style={labelStyle}>Notes</Typography>
          <Typography style={valueStyle}>{this.props.secret.notes || ' '}</Typography>
        </Box>
      </Box>
    )
  }
}

const PasswordOptions = (props: {password: string; visible: boolean; setVisible: (b: boolean) => void}) => {
  const [snackOpen, setSnackOpen] = React.useState(false)

  const copyPassword = () => {
    clipboard.writeText(props.password)
    setSnackOpen(true)
  }

  return (
    <Box display="flex" flexDirection="row" style={{marginTop: -8, height: 34}}>
      {/* <IconButton onClick={() => this.setState({passwordVisible: !this.state.passwordVisible})}>
    <PasswordVisibleIcon />
  </IconButton> */}
      <Button size="small" variant="outlined" onClick={() => props.setVisible(!props.visible)}>
        {props.visible ? 'Hide' : 'Show'}
      </Button>
      <Box style={{paddingRight: 10}} />
      <Button size="small" variant="outlined" onClick={copyPassword}>
        Copy
      </Button>
      <Box style={{paddingRight: 10}} />
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
      >
        <SnackbarContent
          aria-describedby="client-snackbar"
          message={<span id="client-snackbar">Copied to Clipboard</span>}
        />
      </Snackbar>
    </Box>
  )
}

const labelStyle = {
  transform: 'scale(0.75)',
  transformOrigin: 'top left',
  color: 'rgba(0, 0, 0, 0.54)',
  marginTop: -1,
  paddingBottom: 2,
  fontSize: '0.857rem',
}
const valueStyle = {...styles.mono, paddingBottom: 24}

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
