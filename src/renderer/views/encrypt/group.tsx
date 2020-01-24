import * as React from 'react'

import {Button, ButtonGroup, Box, Divider} from '@material-ui/core'

enum Action {
  Encrypt,
  Decrypt,
  Sign,
  Verify,
}

type State = {
  action: Action
}

export default class IndexView extends React.Component<{}, State> {
  state = {
    action: Action.Encrypt,
  }

  render() {
    const {action} = this.state
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{height: '100%'}}>
        <Divider />
        <Box paddingLeft={1} />
        <ButtonGroup color="primary" variant="text">
          <Button
            color={action == Action.Encrypt ? 'default' : 'primary'}
            onClick={() => this.setState({action: Action.Encrypt})}
          >
            Encrypt
          </Button>
          <Button
            color={action == Action.Decrypt ? 'default' : 'primary'}
            onClick={() => this.setState({action: Action.Decrypt})}
          >
            Decrypt
          </Button>
          <Button
            color={action == Action.Sign ? 'default' : 'primary'}
            onClick={() => this.setState({action: Action.Sign})}
          >
            Sign
          </Button>
          <Button
            color={action == Action.Verify ? 'default' : 'primary'}
            onClick={() => this.setState({action: Action.Verify})}
          >
            Verify
          </Button>
        </ButtonGroup>

        {/* {action == Action.Encrypt && <EncryptView />}
        {action == Action.Decrypt && <DecryptView />} */}
      </Box>
    )
  }
}
