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

import {DialogTitle, Link} from '../components'

import UserSignDialog from '../user/dialog'
import ServiceSelect from '../user/service'

import {shell} from 'electron'

import {keyGenerate} from '../rpc/keys'
import {KeyGenerateRequest, KeyGenerateResponse, KeyType} from '../rpc/keys.d'

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

// const transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />
// })

export default class KeyCreateDialog extends React.Component<Props> {
  state = {
    type: KeyType.EDX25519,
    loading: false,
    service: 'github',
    kid: '',
    step: 'KEYGEN',
  }

  reset = () => {
    this.setState({step: 'KEYGEN', type: KeyType.EDX25519, service: 'github', kid: ''})
  }

  close = () => {
    this.props.close()
    setTimeout(this.reset, 200)
  }

  closeUser = (added: boolean) => {
    this.reset()
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
      keyGenerate(req)
        .then((resp: KeyGenerateResponse) => {
          this.props.onChange()
          this.setState({kid: resp.kid, step: 'CREATED', loading: false})
        })
        .catch((err: Error) => {
          this.setState({loading: false})
        })
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
        keyDesc = `An EdX25519 key is the default key capable of signing (Ed25519) and encryption (X25519).`
        break
      case KeyType.X25519:
        keyDesc = 'An X25519 key only provides public key authenticated encryption.'
        break
    }

    return (
      <Dialog
        onClose={this.close}
        open={open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        keepMounted
        id="keyGenerateDialog"
      >
        <DialogTitle loading={this.state.loading} onClose={this.close}>
          Generate Key
        </DialogTitle>
        <DialogContent dividers>
          <Box>
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
            <Typography style={{display: 'inline'}}>{keyDesc} For more details, see </Typography>
            <Link inline onClick={() => shell.openExternal('https://keys.pub/docs/specs/keys.html')}>
              keys.pub/docs/specs/keys
            </Link>
            <Typography style={{display: 'inline'}}>.</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close} id="keyGenerateCloseButton">
            Close
          </Button>
          <Button autoFocus onClick={this.keyGenerate} color="primary" id="keyGenerateButton">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderCreated(open: boolean) {
    let buttonId
    let buttonLabel = 'Close'
    let buttonAction = null
    let next = ''
    let closeLabel = ''
    switch (this.state.type) {
      case KeyType.EDX25519:
        buttonId = 'keyCreatedNextButton'
        buttonLabel = 'Next'
        buttonAction = () => this.setState({step: 'USER'})
        next =
          'In the next step we will ask if you want to publish your key or link it with your account on Github, Twitter, Reddit or a domain.'
        closeLabel = 'Later'
        break
      case KeyType.X25519:
        closeLabel = 'Close'
    }

    return (
      <Dialog
        onClose={this.close}
        open={open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        keepMounted
      >
        {/* TODO: This title? */}
        <DialogTitle onClose={this.close}>Key Created</DialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography style={{paddingBottom: 10}}>We created and saved the key:</Typography>
            <Typography variant="body2" style={{paddingBottom: 10, paddingLeft: 10}}>
              {this.state.kid}
            </Typography>
            <Typography>This key identifier is also the public key, you can share with others.</Typography>
            {next && (
              <Typography>
                In the next step we will ask if you want to publish your key or link it with a user account
                (Github, Twitter, Reddit, etc).
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>{closeLabel}</Button>
          {buttonAction && (
            <Button onClick={buttonAction} color="primary" id={buttonId}>
              {buttonLabel}
            </Button>
          )}
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
        // TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle onClose={this.close}>Publish Key</DialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography>
              Do you want to link this key with a user account (Github, Twitter, Reddit, etc) and publish your
              public key to the{' '}
              <Link inline span onClick={() => shell.openExternal('https://keys.pub/')}>
                keys.pub
              </Link>{' '}
              key server? This helps others search for your key and verify your identity.
            </Typography>
            <Box marginBottom={2} />
            <ServiceSelect service={this.state.service} setService={this.setService} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Later</Button>
          <Button autoFocus onClick={this.selectService} color="primary" id="keyUserLinkButton">
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
