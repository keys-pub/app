import * as React from 'react'

import {Box, Divider, LinearProgress, Typography} from '@material-ui/core'

import {connect} from 'react-redux'
import {query} from '../state'

import {store} from '../../store'

import KeyView from './view'

import {key} from '../../rpc/rpc'
import {RPCError, Key, KeyRequest, KeyResponse} from '../../rpc/types'

type Props = {
  kid: string
  update: boolean
}

interface State {
  key: Key
  loading: boolean
  error: string
}

class KeyIndexView extends React.Component<Props, State> {
  state = {
    error: '',
    key: null,
    loading: false,
  }

  componentDidMount() {
    this.loadKey()
  }

  loadKey = () => {
    this.setState({loading: this.props.update, error: ''})
    const req: KeyRequest = {
      identity: this.props.kid,
      update: this.props.update,
    }
    key(req, (err: RPCError, resp: KeyResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (resp.key) {
        this.setState({key: resp.key, loading: false})
      } else {
        this.setState({error: 'Key not found', loading: false})
      }
    })
  }

  render() {
    const loading = this.state.loading
    return (
      <Box display="flex" flex={1} flexDirection="column">
        {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}
        {this.state.error && (
          <Typography style={{color: 'red', marginLeft: 30}}>{this.state.error}</Typography>
        )}
        <Box paddingBottom={1} />
        {this.state.key && <KeyView value={this.state.key} />}
      </Box>
    )
  }
}

const mapStateToProps = (state: {router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
    update: query(state, 'update') == '1',
  }
}

export default connect(mapStateToProps)(KeyIndexView)
