// @flow
import React from 'react'

import {Box, Typography} from '@material-ui/core'

import styles, {serviceColor} from '../../components/styles'

import type {KeyType, User} from '../../../rpc/types'

export const NameView = (props: {user: User}) => {
  const {user} = props

  const color = serviceColor(user.service)

  return (
    <Box display="flex" flexDirection="row">
      <Box display="flex" flexDirection="row" style={{paddingRight: 8}}>
        <Typography>{user.name}</Typography>
        <Typography style={{color: '#9f9f9f'}}>@</Typography>
        <Typography style={{color}}>{user.service}</Typography>
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
