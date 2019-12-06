// @flow
import React, {Component} from 'react'

import {shell} from 'electron'

import {
  Box,
  Button,
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles, Link, Step} from '../components'

import Header from './header'
import AuthSetup from './setup'
import AuthRecover from './recover'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

type Props = {
  dispatch: (action: any) => any,
}

type State = {
  step: string,
}

class AuthIntroView extends Component<Props, State> {
  state = {
    step: 'intro',
  }

  renderIntro() {
    return (
      <Box display="flex" flex={1} flexDirection="column" alignItems="center">
        <Header loading={false} />
        <Typography style={{paddingBottom: 30, width: 500, textAlign: 'center'}}>
          Hi! If this is the first time you are here, you'll need to create a key. If you've already done
          this, you can recover your key. For more information on how this key is generated, see{' '}
          <Link inline onClick={() => shell.openExternal('https://docs.keys.pub/specs/auth')}>
            docs.keys.pub/specs/auth
          </Link>
          .
        </Typography>
        <Box display="flex" flexDirection="column" style={{marginBottom: 20}}>
          <Button
            color="primary"
            variant="outlined"
            // style={{marginBottom: 20}}
            style={{
              alignSelf: 'center',
              width: 300,
              height: 60,
              marginBottom: 20,
              fontSize: 18,
              // fontWeight: 500,
            }}
            onClick={() => this.setState({step: 'setup'})}
          >
            Create my Key
          </Button>
          <Typography align="center" style={{paddingBottom: 30}}>
            I already have a key &nbsp;
            <Link inline onClick={() => this.setState({step: 'recover'})}>
              recover it
            </Link>
            .
          </Typography>
        </Box>
      </Box>
    )
  }

  render() {
    switch (this.state.step) {
      case 'intro':
        return this.renderIntro()
      case 'setup':
        return <AuthSetup cancel={() => this.setState({step: 'intro'})} />
      case 'recover':
        return <AuthRecover cancel={() => this.setState({step: 'intro'})} />
    }
    return null
  }
}

export default connect<Props, {}, _, _, _, _>()(AuthIntroView)
