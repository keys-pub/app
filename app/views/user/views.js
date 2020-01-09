// @flow
import React from 'react'

import {Box, Typography} from '@material-ui/core'

import styles, {serviceColor} from '../components/styles'

import type {KeyType, User} from '../../rpc/types'

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
    <Box display="flex" flexDirection="row">
      <Box display="flex" flexDirection="row" style={{paddingRight: 8}}>
        <Typography
          style={{
            ...styles.mono,
            maxWidth: 190,
            color: textColor,
            wordWrap: 'break-word',
            wordBreak: 'break-all',
          }}
        >
          {name}
          <wbr />
          <span style={{color: scolor}}>@{user.service}</span>
        </Typography>
      </Box>
    </Box>
  )
}

export const NamesView = (props: {users: Array<User>}) => (
  <Box display="flex" flexDirection="row">
    {props.users.map((user, index) => (
      <NameView user={user} key={user.kid} />
    ))}
  </Box>
)
