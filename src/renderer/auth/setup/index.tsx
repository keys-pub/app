import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from '../../header'
import Logo from '../../logo'
import Link from '../../components/link'

import AuthVaultView from './vault'
import AuthSetupPasswordView from './password'

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
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
        <Header noBack />
        <Logo top={100} />
        <AuthSetupPasswordView />

        <Box style={{paddingTop: 10}}>
          <Typography style={{width: 550, marginTop: 10, textAlign: 'center'}}>
            Do you want to{' '}
            <Link span onClick={this.connect}>
              connect to an existing vault?
            </Link>
          </Typography>
        </Box>
      </Box>
    )
  }

  render() {
    switch (this.state.step) {
      case '':
        return this.renderIntro()
      case 'vault':
        return <AuthVaultView back={this.clear} setup={this.props.refresh} />
    }
  }

  clear = () => {
    this.setState({step: ''})
  }

  connect = () => {
    this.setState({step: 'vault'})
  }
}
