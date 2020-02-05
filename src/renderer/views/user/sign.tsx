import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  IconButton,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon} from '@material-ui/icons'

import * as electron from 'electron'

import {styles, Link, Step} from '../../components'

import {connect} from 'react-redux'
import {goBack, go} from 'connected-react-router'

import {query} from '../state'
import {serviceName} from '../helper'

import {userAdd, RPCError, RPCState} from '../../rpc/rpc'

import {UserAddRequest, UserAddResponse} from '../../rpc/types'

type Props = {
  kid: string
  service: string
  name: string
  signedMessage: string
  dispatch: (action: any) => any
}

type State = {
  error: string
  loading: boolean
  snackOpen: boolean
  url: string
}

class UserSignView extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
    snackOpen: false,
    url: '',
  }

  setUser = () => {
    const req: UserAddRequest = {
      kid: this.props.kid,
      service: this.props.service,
      name: this.props.name,
      url: this.state.url,
      local: false,
    }
    this.setState({loading: true, error: ''})

    // setTimeout(() => {
    //   this.props.dispatch(go(-2))
    //   this.setState({loading: false})
    // }, 2000)

    this.props.dispatch(
      userAdd(
        req,
        (resp: UserAddResponse) => {
          this.props.dispatch(go(-2))
          this.setState({loading: false})
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.details})
        }
      )
    )
  }

  onURLChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({url: target ? target.value : '', error: ''})
  }

  copyToClipboard = () => {
    electron.clipboard.writeText(this.props.signedMessage)
    this.setState({snackOpen: true})
  }

  render() {
    const {service, name} = this.props
    const sn = serviceName(service)
    let title = ''
    let intro = ''
    let instructions = ''
    let openLabel = ''
    let openAction = null
    let placeholder = ''
    let urlLabel = ''
    if (service === 'github') {
      title = 'Link to Github'
      intro = 'Copy the signed message.'
      instructions = 'Create a new gist on your Github account, and paste it there.'
      openLabel = 'Open gist.github.com/new'
      openAction = () => electron.shell.openExternal('https://gist.github.com/new')
      placeholder = 'https://gist.github.com/...'
      urlLabel = "What's the location (URL) on github.com where the signed message was saved?"
    } else if (service === 'twitter') {
      title = 'Link to Twitter'
      intro = 'Copy the signed message.'
      instructions = 'Save it as a tweet on your Twitter account.'
      openLabel = 'Open twitter.com/intent/tweet'
      openAction = () =>
        electron.shell.openExternal('https://twitter.com/intent/tweet?text=' + this.props.signedMessage)
      placeholder = 'https://twitter.com/...'
      urlLabel = "What's the location (URL) on twitter.com where the signed message tweet was saved?"
    }
    // TODO: snackbar here is bleh
    return (
      <Step
        title={title}
        prev={{label: 'Back', action: () => this.props.dispatch(goBack())}}
        next={{label: 'Save', action: () => this.setUser()}}
        loading={this.state.loading}
      >
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
          {this.props.signedMessage}
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
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
    service: (state.rpc.userService && state.rpc.userService.service) || '',
    name: (state.rpc.userSign && state.rpc.userSign.name) || '',
    signedMessage: (state.rpc.userSign && state.rpc.userSign.message) || '',
  }
}

export default connect(mapStateToProps)(UserSignView)
