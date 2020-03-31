import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  LinearProgress,
  Typography,
} from '@material-ui/core'

import * as electron from 'electron'

import {styles, DialogTitle, Link} from '../../components'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import {query} from '../state'
import {store} from '../../store'

import {configSet, userService} from '../../rpc/rpc'

import {
  RPCError,
  ConfigSetRequest,
  ConfigSetResponse,
  UserServiceRequest,
  UserServiceResponse,
} from '../../rpc/types'

type Props = {
  open: boolean
  kid: string
}

type State = {
  loading: boolean
  error?: string
}

class UserIntroDialog extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  select = (service: string) => {
    this.setState({loading: true, error: ''})
    const req: UserServiceRequest = {
      kid: this.props.kid,
      service: service,
    }
    userService(req, (err: RPCError, resp: UserServiceResponse) => {
      if (err) {
        // TODO: error
        return
      }
      this.setState({loading: false})
      store.dispatch(push('/user/name?kid=' + this.props.kid))
      this.close()
    })
  }

  close = () => {
    store.dispatch({type: 'PROMPT_USER', payload: false})
  }

  nothanks = (skip: boolean) => {
    const req: ConfigSetRequest = {key: 'disablePromptUser', value: skip ? '1' : '0'}
    store.dispatch(
      configSet(req, (resp: ConfigSetResponse) => {
        this.close()
      })
    )
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle loading={this.state.loading}>Link your Key</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Link your key with a Github or Twitter account by generating a signed message and posting it
            there. This helps others find your key and verify who you are. For more information, see{' '}
            <Link inline onClick={() => electron.shell.openExternal('https://keys.pub/docs/specs/user.html')}>
              keys.pub/docs/specs/user
            </Link>
            .
          </DialogContentText>
          <Box
            display="flex"
            flexDirection="column"
            style={{paddingTop: 10, paddingBottom: 20, alignItems: 'center'}}
          >
            <Button
              color="secondary"
              style={{
                color: styles.colors.github,
                border: '1px solid ' + styles.colors.github,
                // color: 'white',
                // backgroundColor: colorGithub,
                width: 300,
                height: 60,
                marginBottom: 20,
                textTransform: 'none',
                fontSize: 20,
                fontWeight: 500,
              }}
              onClick={() => this.select('github')}
            >
              <i className="fab fa-github" style={{color: styles.colors.github, fontSize: '2rem'}} /> &nbsp;
              Link to Github
            </Button>
            <Button
              color="primary"
              style={{
                color: styles.colors.twitter,
                border: '1px solid ' + styles.colors.twitter,
                // color: 'white',
                // backgroundColor: colorTwitter,
                width: 300,
                height: 60,
                marginBottom: 20,
                textTransform: 'none',
                fontSize: 20,
                fontWeight: 500,
              }}
              onClick={() => this.select('twitter')}
            >
              <i className="fab fa-twitter" style={{color: styles.colors.twitter, fontSize: '2rem'}} /> &nbsp;
              Link to Twitter
            </Button>

            <Typography>
              <Link
                inline={true}
                onClick={() => this.nothanks(false)}
                style={{width: 300, textAlign: 'center', marginTop: 10}}
              >
                Remind me later
              </Link>
              &nbsp; &mdash; &nbsp;
              <Link
                inline
                onClick={() => this.nothanks(true)}
                style={{width: 300, textAlign: 'center', marginTop: 20}}
              >
                Don't remind me
              </Link>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  return {
    open: false,
    kid: query(state, 'kid'),
  }
}

export default connect(mapStateToProps)(UserIntroDialog)
