import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

import {serviceColor} from '../theme'

import {User, UserStatus} from '../rpc/keys.d'

type Props = {
  user: User
}

export default (props: Props) => {
  const {user} = props

  let textColor = ''
  let scolor = serviceColor(user.service!)

  const DAY = 1000 * 60 * 60 * 24

  switch (user.status) {
    case UserStatus.USER_OK:
      break
    case UserStatus.USER_CONN_FAILURE:
      // TODO: This should be passed from the service
      if (user.verifiedAt && user.verifiedAt < Date.now() - DAY * 7) {
        // Temporary failure?
      } else {
        textColor = 'red'
        scolor = 'red'
      }
      break
    default:
      textColor = 'red'
      scolor = 'red'
      break
  }

  const name = user.name

  return (
    <Typography
      display="inline"
      variant="body2"
      style={{
        color: textColor,
        zoom: '96%',
      }}
    >
      <span style={{wordWrap: 'break-word', wordBreak: 'break-all'}}>{name}</span>
      <wbr />
      <span style={{color: scolor}}>@{user.service}</span>
    </Typography>
  )
}
