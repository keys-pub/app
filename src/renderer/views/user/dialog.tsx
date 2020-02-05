import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {clipboard, shell} from 'electron'

import {styles} from '../../components'
import {store} from '../../store'

import {userAdd, userSign, RPCError, RPCState} from '../../rpc/rpc'
import {UserAddRequest, UserAddResponse, UserSignRequest, UserSignResponse} from '../../rpc/types'

type Props = {
  kid: string
  service: string
  open: boolean
  close: (added: boolean) => void
}

type State = {
  name: string
  error: string
  loading: boolean
  signedMessage: string
  snackOpen: boolean
  url: string
  step: string
}

export default class UserSignDialog extends React.Component<Props, State> {
  state = {
    name: '',
    error: '',
    signedMessage: '',
    loading: false,
    snackOpen: false,
    url: '',
    step: 'name',
  }

  onNameChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({name: target ? target.value : '', error: ''})
  }

  onURLChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({url: target ? target.value : '', error: ''})
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.signedMessage)
    this.setState({snackOpen: true})
  }

  userSign = () => {
    if (this.state.name === '') {
      this.setState({
        error: 'Oops, name is empty',
      })
      return
    }

    this.setState({loading: true, error: ''})
    const req: UserSignRequest = {
      kid: this.props.kid,
      service: this.props.service,
      name: this.state.name,
    }
    store.dispatch(
      userSign(
        req,
        (resp: UserSignResponse) => {
          this.setState({loading: false, name: resp.name, signedMessage: resp.message, step: 'sign'})
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.details})
        }
      )
    )
  }

  userAdd = () => {
    const req: UserAddRequest = {
      kid: this.props.kid,
      service: this.props.service,
      name: this.state.name,
      url: this.state.url,
      local: false,
    }
    this.setState({loading: true, error: ''})

    // setTimeout(() => {
    //   this.props.dispatch(go(-2))
    //   this.setState({loading: false})
    // }, 2000)

    store.dispatch(
      userAdd(
        req,
        (resp: UserAddResponse) => {
          this.setState({loading: false})
          this.props.close(true)
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.details})
        }
      )
    )
  }

  back = () => {
    if (this.state.step == 'sign') {
      this.setState({step: 'name'})
    } else {
      this.props.close(false)
    }
  }

  renderName() {
    const {service} = this.props
    let placeholder = ''
    let question = "What's your username?"
    let next = "In the next step, we'll create a signed message that you can post to your account."
    if (service === 'github') {
      placeholder = 'username'
      question = "What's your Github username?"
      next =
        "In the next step, we'll create a signed message that you can post as a gist on your Github account."
    } else if (service === 'twitter') {
      placeholder = '@username'
      question = "What's your Twitter handle?"
      next = "In the next step, we'll create a signed message that you can post as a tweet."
    }

    return (
      <Box>
        <Typography variant="subtitle1" style={{paddingBottom: 10}}>
          {question}
        </Typography>
        <FormControl error={this.state.error !== ''}>
          <TextField
            autoFocus
            placeholder={placeholder}
            onChange={this.onNameChange}
            value={this.state.name}
            style={{minWidth: 300}}
          />
          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
        </FormControl>
        <Typography variant="body1" style={{paddingTop: 10, paddingBottom: 20}}>
          {next}
        </Typography>
      </Box>
    )
  }

  renderSign() {
    const {service} = this.props
    let intro = ''
    let instructions = ''
    let openLabel = ''
    let openAction = null
    let placeholder = ''
    let urlLabel = ''
    if (service === 'github') {
      intro = 'Copy the signed message.'
      instructions = 'Create a new gist on your Github account, and paste it there.'
      openLabel = 'Open gist.github.com/new'
      openAction = () => shell.openExternal('https://gist.github.com/new')
      placeholder = 'https://gist.github.com/...'
      urlLabel = "What's the location (URL) on github.com where the signed message was saved?"
    } else if (service === 'twitter') {
      intro = 'Copy the signed message.'
      instructions = 'Save it as a tweet on your Twitter account.'
      openLabel = 'Open twitter.com/intent/tweet'
      openAction = () =>
        shell.openExternal('https://twitter.com/intent/tweet?text=' + this.state.signedMessage)
      placeholder = 'https://twitter.com/...'
      urlLabel = "What's the location (URL) on twitter.com where the signed message tweet was saved?"
    }
    return (
      <Box>
        <Box display="flex" flexDirection="row">
          <Typography variant="subtitle1">&bull; &nbsp;</Typography>
          <Typography variant="subtitle1" style={{paddingBottom: 10}}>
            {intro}
          </Typography>
        </Box>
        <Typography
          style={{
            ...styles.mono,
            marginBottom: 5,
            marginLeft: 20,
            backgroundColor: 'black',
            color: 'white',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 12,
            width: 500,
          }}
        >
          {this.state.signedMessage}
        </Typography>
        <Box display="flex" flex={1} flexDirection="row" style={{paddingBottom: 10, marginLeft: 20}}>
          <Button size="small" color="primary" onClick={this.copyToClipboard} disabled={this.state.loading}>
            Copy to Clipboard
          </Button>
        </Box>
        <Box style={{paddingBottom: 20}}>
          <Box display="flex" flexDirection="row">
            <Typography variant="subtitle1">&bull; &nbsp;</Typography>
            <Typography variant="subtitle1" style={{paddingBottom: 10}}>
              {instructions}
            </Typography>
          </Box>
          <Box display="flex" flex={1} flexDirection="row" style={{marginLeft: 20}}>
            <Button color="primary" variant="outlined" onClick={openAction} disabled={this.state.loading}>
              {openLabel}
            </Button>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" flex={1} style={{paddingBottom: 10}}>
          <Box display="flex" flexDirection="row" flex={1}>
            <Typography variant="subtitle1">&bull; &nbsp;</Typography>
            <Typography variant="subtitle1">{urlLabel}</Typography>
          </Box>
          <FormControl error={this.state.error !== ''} style={{marginLeft: 20}}>
            <TextField
              placeholder={placeholder}
              onChange={this.onURLChange}
              value={this.state.url}
              disabled={this.state.loading}
              style={{width: 500}}
            />
            <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
          </FormControl>
        </Box>

        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'right'}}
          open={this.state.snackOpen}
          autoHideDuration={2000}
          onClose={() =>
            this.setState({
              snackOpen: false,
            })
          }
        >
          <SnackbarContent
            aria-describedby="client-snackbar"
            message={<span id="client-snackbar">Copied to Clipboard</span>}
          />
        </Snackbar>
      </Box>
    )
  }

  render() {
    const {service} = this.props

    let title = ''
    if (service === 'github') {
      title = 'Link to Github'
    } else if (service === 'twitter') {
      title = 'Link to Twitter'
    }

    return (
      <Dialog
        onClose={() => this.props.close(false)}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
          {this.state.step == 'name' && this.renderName()}
          {this.state.step == 'sign' && this.renderSign()}
        </DialogContent>
        <DialogActions>
          {this.state.step == 'name' && (
            <Box>
              <Button onClick={() => this.props.close(false)}>Close</Button>
              <Button color="primary" onClick={this.userSign}>
                Next
              </Button>
            </Box>
          )}
          {this.state.step == 'sign' && (
            <Box>
              <Button onClick={this.back}>Back</Button>
              <Button color="primary" onClick={this.userAdd}>
                Save
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    )
  }
}
