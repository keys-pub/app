import * as React from 'react'

import {Typography, Box} from '@material-ui/core'

import {Key, User} from '../../rpc/types'

import {styles} from '../../components'

import {NameView} from './views'

export type Props = {
  kid: string
  user: User
}

export default class UserView extends React.Component<Props> {
  render() {
    const {kid, user} = this.props
    if (!kid) {
      return null
    }

    if (user) {
      return (
        <Box display="inline">
          <NameView user={user} />
        </Box>
      )
    }

    return (
      <Box>
        <Typography style={{...styles.mono}}>{this.props.kid}</Typography>
      </Box>
    )
  }
}
