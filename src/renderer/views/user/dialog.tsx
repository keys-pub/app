import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {clipboard, shell} from 'electron'

import styles from '../../components/styles'
import {DialogTitle} from '../../components/dialog'
import Snack, {SnackProps} from '../../components/snack'

import {userAdd, userSign} from '../../rpc/keys'
import {UserAddRequest, UserAddResponse, UserSignRequest, UserSignResponse} from '../../rpc/keys.d'

type Props = {
  kid: string
  service: string
  open: boolean
  close: (added: boolean) => void
}

type State = {
  name: string
  error?: Error
  loading: boolean
  signedMessage: string
  snack?: SnackProps
  snackOpen: boolean
  step: string
  url: string
}

export default class UserSignDialog extends React.Component<Props, State> {
  state: State = {
    loading: false,
    name: '',
    signedMessage: '',
    snackOpen: false,
    step: 'name',
    url: '',
  }

  clear = () => {
    this.setState({name: '', error: undefined, signedMessage: '', loading: false, url: '', step: 'name'})
  }

  close = (changed: boolean) => {
    this.clear()
    this.props.close(changed)
  }

  onNameChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({name: target ? target.value : '', error: undefined})
  }

  onURLChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({url: target ? target.value : '', error: undefined})
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.signedMessage)
    this.setState({snack: {message: 'Copied to Clipboard', duration: 2000}, snackOpen: true})
  }

  userSign = () => {
    if (this.state.name === '') {
      this.setState({
        error: new Error('Oops, name is empty'),
      })
      return
    }

    this.setState({loading: true, error: undefined})
    const req: UserSignRequest = {
      kid: this.props.kid,
      service: this.props.service,
      name: this.state.name,
    }
    userSign(req)
      .then((resp: UserSignResponse) => {
        const name = resp.name || ''
        const message = resp.message || ''
        let url = this.defaultURL(this.props.service, this.props.kid, name, message)

        this.setState({
          loading: false,
          name,
          url,
          signedMessage: message,
          step: 'sign',
        })
      })
      .catch((err: Error) => {
        this.setState({loading: false, error: err})
      })
  }

  defaultURL = (service: string, kid: string, name: string, message: string) => {
    switch (service) {
      case 'https':
        return 'https://' + name + '/keyspub.txt'
      case 'echo':
        let msg = message.replace(/(\r\n|\n|\r)/gm, '')
        msg = encodeURIComponent(msg).replace(/%20/g, '+')
        return 'test://echo/' + name + '/' + kid + '/' + msg
      default:
        return ''
    }
  }

  userAdd = () => {
    const req: UserAddRequest = {
      kid: this.props.kid,
      service: this.props.service,
      name: this.state.name,
      url: this.state.url,
      local: false,
    }
    this.setState({loading: true, error: undefined})

    // setTimeout(() => {
    //   this.props.dispatch(go(-2))
    //   this.setState({loading: false})
    // }, 2000)

    userAdd(req)
      .then((resp: UserAddResponse) => {
        this.setState({loading: false})
        this.close(true)
      })
      .catch((err: Error) => {
        this.setState({loading: false, error: err})
      })
  }

  back = () => {
    if (this.state.step == 'sign') {
      this.setState({step: 'name', error: undefined})
    } else {
      this.close(false)
    }
  }

  renderName() {
    const {service} = this.props

    let placeholder = ''
    let question = "What's your username?"
    let next =
      "In the next step, we'll create a signed message using this key that you can post to your account."
    switch (service) {
      case 'github':
        placeholder = 'username'
        question = "What's your Github username?"
        next =
          "In the next step, we'll create a signed message using this key that you can post as a gist on your Github account."
        break
      case 'twitter':
        placeholder = '@username'
        question = "What's your Twitter handle?"
        next = "In the next step, we'll create a signed message using this key that you can post as a tweet."
        break
      case 'reddit':
        placeholder = 'username'
        question = "What's your Reddit username?"
        next =
          "In the next step, we'll create a signed message using this key that you can post on r/keyspubmsgs."
        break
      case 'https':
        placeholder = ''
        question = "What's the domain name?"
        next =
          "In the next step, we'll create a signed message that you can put on your domain as /keyspub.txt."
        break
      case 'echo':
        placeholder = ''
        question = "What's your test name?"
        next = "In the next step, we'll save it."
        break
    }

    return (
      <Box>
        <Typography variant="subtitle1" style={{paddingBottom: 10}}>
          {question}
        </Typography>
        <FormControl error={!!this.state.error}>
          <TextField
            autoFocus
            placeholder={placeholder}
            onChange={this.onNameChange}
            value={this.state.name}
            style={{minWidth: 300}}
            id="userNameTextField"
            inputProps={{spellCheck: 'false', style: {...styles.mono}}}
          />
          <FormHelperText>{this.state.error?.message || ' '}</FormHelperText>
        </FormControl>
        <Typography variant="body1" style={{paddingBottom: 20}}>
          {next}
        </Typography>
      </Box>
    )
  }

  renderSign() {
    const {service} = this.props
    let intro = 'Copy the signed message.'
    let instructions
    let openLabel = ''
    let openAction = () => {}
    let placeholder = ''
    let urlLabel = ''
    switch (service) {
      case 'github':
        instructions = <Typography>Create a new gist on your Github account, and paste it there.</Typography>
        openLabel = 'Open gist.github.com/new'
        openAction = () => shell.openExternal('https://gist.github.com/new')
        placeholder = 'https://gist.github.com/...'
        urlLabel = "What's the location (URL) on github.com where the signed message was saved?"
        break
      case 'twitter':
        instructions = <Typography>Save it as a tweet on your Twitter account.</Typography>
        openLabel = 'Open twitter.com/intent/tweet'
        openAction = () =>
          shell.openExternal('https://twitter.com/intent/tweet?text=' + this.state.signedMessage)
        placeholder = 'https://twitter.com/...'
        urlLabel = "What's the location (URL) on twitter.com where the tweet was saved?"
        break
      case 'reddit':
        instructions = <Typography>Save it as a post on r/keyspubmsgs.</Typography>
        openLabel = 'Open reddit.com/r/keyspubmsgs/submit'
        const postTitle = this.state.name + ' ' + this.props.kid
        openAction = () =>
          shell.openExternal(
            'https://old.reddit.com/r/keyspubmsgs/submit?title=' +
              postTitle +
              '&text=' +
              this.state.signedMessage
          )
        placeholder = 'https://reddit.com/...'
        urlLabel = "What's the location (URL) on reddit.com where the signed message was posted?"
        break
      case 'https':
        instructions = (
          <Typography>
            Save it to any of the following locations:
            <br />
            <span style={{...styles.mono}}>https://{this.state.name}/keyspub.txt</span>
            <br />
            <span style={{...styles.mono}}>https://{this.state.name}/.well-known/keyspub.txt</span>
          </Typography>
        )
        placeholder = 'https://' + this.state.name + '/keyspub.txt'
        urlLabel = 'Where did you save it?'
        break
      case 'echo':
        intro = 'Siged message:'
        placeholder = ''
        urlLabel = 'Test URL:'
        break
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

        {instructions && (
          <Box display="flex" flexDirection="row">
            <Typography variant="subtitle1">&bull; &nbsp;</Typography>
            {instructions}
          </Box>
        )}
        {openLabel && (
          <Box display="flex" flex={1} flexDirection="row" style={{marginLeft: 20}}>
            <Button color="primary" variant="outlined" onClick={openAction} disabled={this.state.loading}>
              {openLabel}
            </Button>
          </Box>
        )}
        {(instructions || openLabel) && <Box style={{paddingBottom: 20}} />}

        {urlLabel && (
          <Box display="flex" flexDirection="column" flex={1}>
            <Box display="flex" flexDirection="row" flex={1}>
              <Typography variant="subtitle1">&bull; &nbsp;</Typography>
              <Typography variant="subtitle1">{urlLabel}</Typography>
            </Box>
            <Box display="flex" flexDirection="row" flex={1} style={{marginLeft: 20}}>
              <TextField
                placeholder={placeholder}
                onChange={this.onURLChange}
                value={this.state.url}
                error={!!this.state.error}
                helperText={this.state.error?.message || ' '}
                FormHelperTextProps={{style: styles.breakWords}}
                disabled={this.state.loading}
                style={{width: 500}}
                inputProps={{spellCheck: 'false', style: {...styles.mono, fontSize: 12}}}
              />
            </Box>
          </Box>
        )}
        {!urlLabel && (
          <Typography style={{paddingLeft: 16, color: 'red'}}>{this.state.error?.message}</Typography>
        )}

        <Snack
          open={this.state.snackOpen}
          {...this.state.snack}
          onClose={() => this.setState({snackOpen: false})}
        />
      </Box>
    )
  }

  render() {
    const {service} = this.props

    let title = ''
    switch (service) {
      case 'github':
        title = 'Link to Github'
        break
      case 'twitter':
        title = 'Link to Twitter'
        break
      case 'reddit':
        title = 'Link to Reddit'
        break
      case 'https':
        title = 'Link to Website (HTTPS)'
        break
      case 'echo':
        title = 'Link to Echo'
        break
    }

    return (
      <Dialog
        onClose={() => this.close(false)}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        transitionDuration={0}
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle loading={this.state.loading} onClose={() => this.close(false)}>
          {title}
        </DialogTitle>
        <DialogContent dividers>
          {this.state.step == 'name' && this.renderName()}
          {this.state.step == 'sign' && this.renderSign()}
        </DialogContent>
        <DialogActions>
          {this.state.step == 'name' && (
            <Box>
              <Button onClick={() => this.close(false)}>Close</Button>
              <Button color="primary" onClick={this.userSign} id="userSignButton">
                Next
              </Button>
            </Box>
          )}
          {this.state.step == 'sign' && (
            <Box>
              <Button onClick={this.back}>Back</Button>
              <Button color="primary" onClick={this.userAdd} id="userAddButton">
                Save
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    )
  }
}
