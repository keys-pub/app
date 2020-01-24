import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {styles} from '../../components'

import {goBack} from 'connected-react-router'

import RecipientsView from '../user/recipients'

import {store} from '../../store'
import {query} from '../state'

import {encrypt, RPCError, RPCState} from '../../rpc/rpc'

import {UserSearchResult, EncryptRequest, EncryptResponse} from '../../rpc/types'

export type Props = {
  value: string
}

class EncryptedView extends React.Component<Props> {
  close() {
    store.dispatch(goBack())
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <Input
          multiline
          readOnly
          value={this.props.value}
          disableUnderline
          inputProps={{
            style: {
              ...styles.mono,
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
        <Divider />
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
          <Button color="secondary" variant="outlined" onClick={this.close}>
            Close
          </Button>
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  let encrypted = ''
  if (state.rpc.encrypt) {
    encrypted = new TextDecoder('ascii').decode(state.rpc.encrypt.data)
  }

  return {
    value: encrypted,
  }
}
export default connect(mapStateToProps)(EncryptedView)
