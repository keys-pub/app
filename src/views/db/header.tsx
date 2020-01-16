import * as React from 'react'

import {Box, Button, Divider, TextField, Typography} from '@material-ui/core'

import {connect} from 'react-redux'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  query: string
}

class DBHeaderView extends React.Component<Props, State> {
  state = {
    query: '',
  }

  refresh = () => {}

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({query: target.value || ''})
  }

  render() {
    return (
      <Box style={{height: 60}}>
        <Box
          display="flex"
          flexDirection="row"
          style={{
            paddingLeft: 10,
            paddingBottom: 10,
            paddingTop: 10,
          }}
        >
          <TextField
            type="search"
            placeholder="filter"
            variant="outlined"
            margin="dense"
            style={{alignSelf: 'center', width: 400}}
            inputProps={{style: {}}}
            value={this.state.query}
            onChange={this.onInputChange}
          />
          <Button size="small" color="primary" style={{marginRight: 10}} onClick={this.refresh}>
            Refresh
          </Button>
        </Box>
        <Divider />
      </Box>
    )
  }
}

// $FlowFixMe
export default connect()(DBHeaderView)
