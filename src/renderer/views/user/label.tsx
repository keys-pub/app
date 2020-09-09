import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

import styles, {serviceColor} from '../../components/styles'

import {User, UserStatus} from '../../rpc/keys.d'

type Props = {
  user: User
}

export default (props: Props) => {
  const {user} = props

  let textColor = ''
  let scolor = serviceColor(user.service!)

  if (user.status == UserStatus.USER_OK || user.status == UserStatus.USER_CONN_FAILURE) {
    // Don't show red on conn failure
  } else {
    textColor = 'red'
    scolor = 'red'
  }

  const name = user.name

  return (
    <Typography
      display="inline"
      style={{
        ...styles.mono,
        color: textColor,
      }}
    >
      <span style={{wordWrap: 'break-word', wordBreak: 'break-all'}}>{name}</span>
      <wbr />
      <span style={{color: scolor}}>@{user.service}</span>
    </Typography>
  )
}
