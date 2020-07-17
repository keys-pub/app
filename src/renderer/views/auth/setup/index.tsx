import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Logo from '../../logo'
import {Link} from '../../../components'

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
      <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
        <Logo top={60} />
        <AuthSetupPasswordView />

        <Box style={{paddingTop: 10}}>
          <Typography style={{width: 550, marginTop: 10, textAlign: 'center'}}>
            Or do you want to{' '}
            <Link span onClick={this.connect}>
              connect to an existing vault
            </Link>
            ?
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
        break
    }
  }

  clear = () => {
    this.setState({step: ''})
  }

  connect = () => {
    this.setState({step: 'vault'})
  }
}
