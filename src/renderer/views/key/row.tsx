import * as React from 'react'

import {Typography, Box} from '@material-ui/core'

import {Key, User} from '../../rpc/types'

import {styles} from '../../components'

export type Props = {
  value: Key
}

export default class KeyRowView extends React.Component<Props> {
  render() {
    if (!this.props.value) {
      return null
    }

    const users: User[] = this.props.value.users || []
    if (users.length > 0) {
      return (
        <Box display="inline">
          {users.map((u: User, index: number) => (
            <Box display="inline">
              <Typography display="inline" style={{...styles.mono}}>
                {u.label}
              </Typography>
              {index < users.length - 1 && <Typography display="inline">, </Typography>}
            </Box>
          ))}
        </Box>
      )
    }

    return (
      <Box>
        <Typography style={{...styles.mono}}>{this.props.value.id}</Typography>
      </Box>
    )
  }
}
