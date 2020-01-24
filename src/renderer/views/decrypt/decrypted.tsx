import * as React from 'react'

import {connect} from 'react-redux'

import {Button, Divider, Input, Box} from '@material-ui/core'

import {goBack} from 'connected-react-router'

import {store} from '../../store'

import {RPCState} from '../../rpc/rpc'

export type Props = {
  value: string
}

class DecryptedView extends React.Component<Props> {
  close() {
    store.dispatch(goBack())
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Divider />
        <Input
          multiline
          readOnly
          value={this.props.value}
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
  let decrypted = ''
  if (state.rpc.decrypt) {
    decrypted = new TextDecoder().decode(state.rpc.decrypt.data)
  }

  return {
    value: decrypted,
  }
}
export default connect(mapStateToProps)(DecryptedView)
