import * as React from 'react'

import * as electron from 'electron'

import {Box, Button, Divider, Input, InputLabel, FormControl, Typography} from '@material-ui/core'
import {Splash, Step, Link} from '../components'

import {keyGenerate} from '../../rpc/rpc'

import {push} from 'connected-react-router'

import {connect} from 'react-redux'

import {RPCState} from '../../rpc/rpc'
import {KeyGenerateRequest, KeyGenerateResponse} from '../../rpc/types'
import {State as RState} from '../state'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  loading: boolean
}

class KeyCreateView extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  register = () => {
    // TODO: push setting
    this.setState({loading: true})
    this.props.dispatch(
      keyGenerate({}, (resp: KeyGenerateResponse) => {
        this.setState({loading: false})
        // TODO: Show key
        this.props.dispatch(push('/key/index?kid=' + resp.kid))
      })
    )
  }

  recover = () => {
    this.props.dispatch(push('/key/recover'))
  }

  render() {
    return (
      <Step title="Welcome!">
        <Box>
          <Box style={{display: 'inline'}}>
            <Typography variant="body1">
              Next we'll need to generate a new key. For more information about how keys are generated and
              what information is published, see{' '}
              <Link
                inline
                style={{}}
                onClick={() => electron.shell.openExternal('https://docs.keys.pub/auth')}
              >
                docs.keys.pub
              </Link>
              .
            </Typography>
            {/* <Link onClick={() => console.log('Tell me more')} style={{fpaddingLeft: 4}} inline>
            Tell me more
          </Link> */}
          </Box>

          <Box
            display="flex"
            flexDirection="row"
            alignSelf="center"
            style={{marginTop: 30, marginBottom: 30}}
          >
            <Button
              color="primary"
              variant="outlined"
              size="large"
              onClick={this.register}
              disabled={this.state.loading}
            >
              Generate a Key
            </Button>
          </Box>
          <Typography variant="body1" paragraph>
            If you've already done this and have access to your backup recovery phrase, you can{' '}
            <Link inline onClick={this.recover} style={{}}>
              recover an existing user key
            </Link>
            .
          </Typography>
        </Box>
      </Step>
    )
  }
}

const mapStateToProps = (state: RState, ownProps: any) => {
  return {}
}

export default connect(mapStateToProps)(KeyCreateView)
