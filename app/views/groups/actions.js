// @flow
import React, {Component} from 'react'

import {Box, Button, Divider} from '@material-ui/core'

type Props = {
  create: () => void,
  join: () => void,
}

export default class GroupsActions extends Component<Props> {
  render() {
    return (
      <Box
        style={{
          height: 60,
          backgroundColor: '#42464d',
        }}
      >
        <Box
          display="flex"
          flex={1}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          style={{
            position: 'relative',
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={this.props.create}
            style={{marginRight: 25, backgroundColor: '#efefef', width: 80, height: 20}}
          >
            New
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={this.props.join}
            style={{backgroundColor: '#efefef', width: 80, height: 20}}
          >
            Join
          </Button>
        </Box>
        <Divider />
      </Box>
    )
  }
}
