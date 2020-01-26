import * as React from 'react'

import {Typography, Box} from '@material-ui/core'

import {Key, User} from '../../rpc/types'

import {styles} from '../../components'

import {NameView} from './views'

export type Props = {
  kid: string
  users: User[]
}

export default class UserView extends React.Component<Props> {
  render() {
    const {kid, users} = this.props
    if (!kid) {
      return null
    }

    if (users.length > 0) {
      return (
        <Box display="inline">
          {users.map((u: User, index: number) => (
            <Box display="inline">
              <NameView user={u} />
              {index < users.length - 1 && <Typography display="inline">, </Typography>}
            </Box>
          ))}
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
