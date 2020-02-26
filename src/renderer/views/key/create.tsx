import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Slide,
  Typography,
} from '@material-ui/core'

import {TransitionProps} from '@material-ui/core/transitions'

import {store} from '../../store'

import {styles, DialogTitle, Link} from '../../components'
import UserSignDialog from '../user/dialog'
import ServiceSelect from '../user/service-select'

import {shell} from 'electron'

import {keyGenerate} from '../../rpc/rpc'
import {KeyGenerateRequest, KeyGenerateResponse, KeyType} from '../../rpc/types'

type Props = {
  open: boolean
  close: () => void
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
    this.setState({loading: true})
    // Make generate take a second
    setTimeout(() => {
      const req: KeyGenerateRequest = {
        type: this.state.type,
      }
      store.dispatch(
        keyGenerate(req, (resp: KeyGenerateResponse) => {
          this.props.onChange()
          store.dispatch({type: 'INTRO', payload: false})
          this.setState({kid: resp.kid, step: 'CREATED', loading: false})
        })
      )
    }, 500)
  }

  selectService = () => {
    this.setState({step: 'SIGN'})
  }

  setType = (event: React.ChangeEvent<{value: unknown}>) => {
    const type = event.target.value as KeyType
    this.setState({type})
  }

  setService = (service: string) => {
    this.setState({service})
  }

  renderKeygen(open: boolean) {
    let keyDesc = ''
    switch (this.state.type) {
      case KeyType.EDX25519:
        keyDesc = `An EdX25519 key is the default key capable of signing and encryption. Ed25519 is an elliptic curve signing algorithm using EdDSA and Curve25519 and can be converted to an X25519 encryption key.`
        break
      case KeyType.X25519:
        keyDesc =
          'X25519 is an elliptic curve Diffie-Hellman key exchange using Curve25519. X25519 keys only provide public key authenticated encryption.'
        break
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
        <DialogTitle loading={this.state.loading}>Generate Key</DialogTitle>
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
            <Typography style={{display: 'inline'}}>{keyDesc}</Typography>
            <Typography style={{display: 'inline'}}>&nbsp;For more details, see </Typography>
            <Link inline onClick={() => shell.openExternal('https://keys.pub/docs/specs/keys.html')}>
              keys.pub/docs/specs/keys
            </Link>
            <Typography style={{display: 'inline'}}>.</Typography>
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
        {/* TODO: This title? */}
        <DialogTitle>Key Created</DialogTitle>
        <DialogContent dividers>
          <Box style={{minHeight}}>
            <Typography style={{paddingBottom: 10}}>We created and saved the key:</Typography>
            <Typography style={{...styles.mono, paddingBottom: 10, paddingLeft: 10}}>
              {this.state.kid}
            </Typography>
            <Typography>This key identifier is also the public key, you can share with others.</Typography>
            <Typography>
              In the next step we will ask if you want to publish your key or link it with a user account
              (Github, Twitter, Reddit, etc).
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Later</Button>
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
              Do you want to link this key with a user account (Github, Twitter, Reddit, etc) and publish it
              to the{' '}
              <Link inline span onClick={() => shell.openExternal('https://keys.pub/')}>
                keys.pub
              </Link>{' '}
              key server? This helps others search for your key and verify your identity. You should only do
              this if you're ok with your key being public.
            </Typography>
            <Box marginBottom={2} />
            <ServiceSelect service={this.state.service} setService={this.setService} />
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
