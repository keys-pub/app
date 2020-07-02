import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Logo from '../../logo'

import {push} from 'connected-react-router'
import {store} from '../../../store'
import AuthSetupPasswordView from './password'
import AuthVaultView from './vault'

type Props = {
  refresh: () => void
}
type State = {
  step: string
}

export default class AuthSetupView extends React.Component<Props, State> {
  state = {
    step: '',
  }
  renderIntro() {
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
        <Logo top={60} />
        <Typography style={{paddingTop: 10, paddingBottom: 20, width: 550, textAlign: 'center'}}>
          Hi! If this is the first time you've setup the app, you'll want to create a vault.
          <br />A vault is an encrypted store for keys and secrets.
        </Typography>

        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          <Button color="primary" variant="outlined" size="large" onClick={this.setup} style={{width: 250}}>
            Create a Vault
          </Button>
        </Box>

        <Typography style={{paddingTop: 20, paddingBottom: 20, width: 550, textAlign: 'center'}}>
          If you've already setup a remote vault, you can connect to it.
        </Typography>

        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          <Button color="primary" variant="outlined" size="large" onClick={this.vault} style={{width: 250}}>
            Connect to a Vault
          </Button>
        </Box>
      </Box>
    )
  }

  render() {
    switch (this.state.step) {
      case '':
        return this.renderIntro()
      case 'password':
        return <AuthSetupPasswordView back={this.back} />
        break
      case 'vault':
        return <AuthVaultView back={this.back} setup={this.props.refresh} />
        break
    }
  }

  back = () => {
    this.setState({step: ''})
  }

  setup = () => {
    this.setState({step: 'password'})
  }

  vault = () => {
    this.setState({step: 'vault'})
  }
}
