import * as React from 'react'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {
  Button,
  ButtonGroup,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Input,
  Typography,
  Box,
} from '@material-ui/core'

import {styles} from '../../components'

import RecipientsView from '../user/recipients'

import {store} from '../../store'
import {query} from '../state'

import {encrypt, RPCError, RPCState} from '../../rpc/rpc'

import {UserSearchResult, EncryptRequest, EncryptResponse} from '../../rpc/types'

export type Props = {
  kid: string
}

type State = {
  error: string
  recipients: UserSearchResult[]
  loading: boolean
  value: string
}

class EncryptView extends React.Component<Props, State> {
  state = {
    error: '',
    loading: false,
    value: '',
    recipients: [],
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({value: target.value || '', error: ''})
  }

  encrypt = () => {
    this.setState({loading: true, error: ''})

    const recs = this.state.recipients.map((r: UserSearchResult) => {
      return r.kid
    })

    const data = new TextEncoder().encode(this.state.value)
    const req: EncryptRequest = {
      data: data,
      armored: true,
      recipients: recs,
      sender: this.props.kid,
    }
    store.dispatch(
      encrypt(
        req,
        (resp: EncryptResponse) => {
          this.setState({loading: false, error: ''})
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <Box paddingLeft={1} paddingRight={1} paddingTop={1} paddingBottom={1}>
          <RecipientsView
            onChange={(recipients: UserSearchResult[]) => {
              this.setState({recipients: recipients})
            }}
          />
        </Box>
        <Divider />

        <Input
          multiline
          autoFocus
          onChange={this.onInputChange}
          value={this.state.value}
          disableUnderline
          inputProps={{
            style: {
              height: '100%',
            },
          }}
          style={{
            height: '100%',
            paddingLeft: 10,
            paddingTop: 10,
            overflowY: 'scroll',
          }}
        />
        {!this.state.loading && <Divider style={{marginBottom: 3}} />}
        {this.state.loading && <LinearProgress />}
        <Box
          display="flex"
          flexDirection="row"
          style={{
            paddingLeft: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingRight: 20,
          }}
        >
          <Button color="primary" variant="outlined" onClick={this.encrypt} disabled={this.state.loading}>
            Encrypt
          </Button>
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
  }
}
export default connect(mapStateToProps)(EncryptView)
