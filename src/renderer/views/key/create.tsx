import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Slide,
  Typography,
} from '@material-ui/core'

import {TransitionProps} from '@material-ui/core/transitions'

import {store} from '../../store'

import {styles, Link} from '../../components'
import UserSignDialog from '../user/dialog'

import {shell} from 'electron'

import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {keyGenerate, userService, RPCState} from '../../rpc/rpc'
import {
  KeyGenerateRequest,
  KeyGenerateResponse,
  UserServiceRequest,
  UserServiceResponse,
  KeyType,
} from '../../rpc/types'

type Props = {
  open: boolean
  close: () => void
  intro: boolean
  onChange: () => void
}

type State = {
  type: KeyType
  service: string
  kid: string
  step: 'KEYGEN' | 'CREATED' | 'USER' | 'SIGN'
}

const transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const minHeight = 125

export default class KeyCreateDialog extends React.Component<Props> {
  state = {
    type: KeyType.EDX25519,
    loading: false,
    service: 'github',
    kid: '',
    step: 'KEYGEN',
  }

  close = () => {
    this.setState({step: 'KEYGEN'})
    store.dispatch({type: 'INTRO', payload: false})
    this.props.close()
  }

  closeUser = (added: boolean) => {
    if (added) {
      this.props.onChange()
    }
    this.props.close()
  }

  keyGenerate = () => {
    const req: KeyGenerateRequest = {
      type: this.state.type,
    }
    store.dispatch(
      keyGenerate(req, (resp: KeyGenerateResponse) => {
        this.props.onChange()
        store.dispatch({type: 'INTRO', payload: false})
        this.setState({kid: resp.kid, step: 'CREATED'})
      })
    )
  }

  selectService = () => {
    this.setState({step: 'SIGN'})
  }

  setType = (event: React.ChangeEvent<{value: unknown}>) => {
    const type = event.target.value as KeyType
    this.setState({type})
  }

  setService = (event: React.ChangeEvent<{value: unknown}>) => {
    const service = event.target.value as string
    this.setState({service})
  }

  renderKeygen(open: boolean) {
    return (
      <Dialog
        onClose={this.close}
        open={open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle>Generate Key</DialogTitle>
        <DialogContent dividers>
          <Box style={{minHeight}}>
            <FormControl variant="outlined">
              <Select value={this.state.type} onChange={this.setType}>
                <MenuItem value={KeyType.EDX25519}>
                  <Typography style={{width: 400}}>
                    Signing/Encryption (EdX25519)<span style={{color: '#999999'}}>&nbsp;(recommended)</span>
                  </Typography>
                </MenuItem>
                <MenuItem value={KeyType.X25519}>
                  <Typography style={{width: 400}}>Encryption (X25519)</Typography>
                </MenuItem>
              </Select>
            </FormControl>
            <Box marginBottom={2} />
            <Typography style={{height: 60}}>{keyDescription(this.state.type)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Close</Button>
          <Button autoFocus onClick={this.keyGenerate} color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderCreated(open: boolean) {
    let buttonLabel = 'Close'
    let buttonAction = this.close
    switch (this.state.type) {
      case KeyType.EDX25519:
        buttonLabel = 'Next'
        buttonAction = () => this.setState({step: 'USER'})
      case KeyType.X25519:
      // TODO
    }

    return (
      <Dialog
        onClose={this.close}
        open={open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle>Key Created</DialogTitle>
        <DialogContent dividers>
          <Box style={{minHeight}}>
            <Typography style={{paddingBottom: 10}}>We created and saved the key:</Typography>
            <Typography style={{...styles.mono, paddingBottom: 10, paddingLeft: 10}}>
              {this.state.kid}
            </Typography>
            <Typography>This key identifier is also the public key, you can share with others.</Typography>
            <Typography>
              In the next step we will ask if you want to publish your key or link it with a 3rd party
              account.
            </Typography>
            {/* <Typography style={{display: 'inline'}}>For more details, see{' '}</Typography>
              <Link inline onClick={() => shell.openExternal('http://docs.keys.pub/spec/keys')}>
                docs.keys.pub/spec/keys
              </Link>
              <Typography style={{display: 'inline'}}>.</Typography> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={buttonAction} color="primary">
            {buttonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderUser(open: boolean) {
    return (
      <Dialog
        onClose={this.close}
        open={open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle>Publish / Link Key</DialogTitle>
        <DialogContent dividers>
          <Box style={{minHeight}}>
            <Typography>
              Do you want to associate this key with a user account (such as Github or Twitter) and publish it
              to the{' '}
              <Link inline span onClick={() => {}}>
                keys.pub
              </Link>{' '}
              key server? This helps others search for your key and verify your identity.
              {/* You can
          revoke this at any time. For more details, see{' '}
          <Link inline onClick={() => shell.openExternal('http://docs.keys.pub/user')}>
            docs.keys.pub/user
          </Link> */}
            </Typography>
            <Box marginBottom={2} />
            <FormControl variant="outlined">
              <Select value={this.state.service} onChange={this.setService} style={{minWidth: 200}}>
                <MenuItem value={'github'}>Link to Github</MenuItem>
                <MenuItem value={'twitter'}>Link to Twitter</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Later</Button>
          <Button autoFocus onClick={this.selectService} color="primary">
            Next
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderUserSign(open: boolean) {
    return (
      <UserSignDialog kid={this.state.kid} service={this.state.service} open={open} close={this.closeUser} />
    )
  }

  render() {
    switch (this.state.step) {
      case 'KEYGEN':
        return this.renderKeygen(this.props.open)
      case 'CREATED':
        return this.renderCreated(this.props.open)
      case 'USER':
        return this.renderUser(this.props.open)
      case 'SIGN':
        return this.renderUserSign(this.props.open)
    }
    return null
  }
}

const keyTypeFromString = (s: string, dflt: KeyType): KeyType => {
  if (!s) return dflt
  switch (s) {
    case KeyType.EDX25519:
      return KeyType.EDX25519
    case KeyType.X25519:
      return KeyType.X25519
  }
  return KeyType.UNKNOWN_KEY_TYPE
}

export const keyDescription = (type: KeyType): string => {
  switch (type) {
    case KeyType.EDX25519:
      return `Ed25519 is an elliptic curve signing algorithm using EdDSA and Curve25519. 
        This key can be converted to an X25519 encryption key.`
    case KeyType.X25519:
      return 'X25519 is an elliptic curve Diffie-Hellman key exchange using Curve25519. X25519 keys are used for public key authenticated encryption.'
  }
}
