import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

import styles, {serviceColor} from '../../components/styles'

import {User} from '../../rpc/types'

export const NameView = (props: {user: User}) => {
  const {user} = props

  let textColor = ''
  let scolor = serviceColor(user.service)

  if (user.status !== 'OK') {
    textColor = 'red'
    scolor = 'red'
  }
  const name = user.name

  return (
    <Box display="inline">
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
    </Box>
  )
}

export const NamesView = (props: {users: Array<User>}) => (
  <Box display="flex" flexDirection="column">
    {props.users.map((user, index) => (
      <NameView user={user} key={'name-' + user.kid + '-' + user.seq} />
    ))}
  </Box>
)
