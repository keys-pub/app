import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

import styles, {serviceColor} from '../../components/styles'

import {User, UserStatus} from '../../rpc/types'

export default (props: {kid: string; user: User}) => {
  const {user} = props

  if (!user) {
    return (
      <Typography
        display="inline"
        style={{
          ...styles.mono,
          ...styles.breakWords,
        }}
      >
        {props.kid}
      </Typography>
    )
  }

  let textColor = ''
  let scolor = serviceColor(user.service)

  if (user.status !== UserStatus.USER_OK) {
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
