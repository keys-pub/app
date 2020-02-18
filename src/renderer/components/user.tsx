import * as React from 'react'

import {Box, Button, Typography} from '@material-ui/core'

import {styles} from '.'

import {User} from '../rpc/types'

type ButtonProps = {
  user: User
  onClick: () => void
  children?: any
  style?: any
}

export const UserButton = (props: ButtonProps) => {
  const style = props.style || {}
  const user: User = props.user
  let service = user.service
  let name = user.id
  let size = 14

  if (name.length > 24) {
    name = name.slice(0, 24) + '…'
  }

  // Font size to fit
  if (name.length >= 24) {
    size = 11
  } else if (name.length >= 22) {
    size = 12
  } else if (name.length >= 20) {
    size = 13
  } else if (name.length >= 18) {
    size = 14
  } else if (name.length >= 16) {
    size = 14
  }

  return (
    <Button
      style={{
        color: 'white',
        width: '100%',
        minHeight: 36,
        padding: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textTransform: 'none',
      }}
      color="primary"
      variant="outlined"
      onClick={props.onClick}
    >
      <Box display="flex" flexDirection="column">
        <Typography style={{...styles.mono, color: 'white', fontSize: size}}>{name}</Typography>
        {service !== '' && (
          <Typography style={{textTransform: 'lowercase', marginTop: -6, fontSize: 12, color: '#999'}}>
            @{service}
          </Typography>
        )}
      </Box>
    </Button>
  )
}

type LabelProps = {
  user: User
  children?: any
  style?: any
}

export const UserLabel = (props: LabelProps) => {
  const style = props.style || {}
  const user: User = props.user
  let service = user.service
  let name = user.id
  let size = 14

  if (name.length > 24) {
    name = name.slice(0, 24) + '…'
  }

  // Font size to fit
  if (name.length >= 24) {
    size = 11
  } else if (name.length >= 22) {
    size = 12
  } else if (name.length >= 20) {
    size = 13
  } else if (name.length >= 18) {
    size = 14
  } else if (name.length >= 16) {
    size = 14
  }

  return (
    <Box display="flex" flexDirection="column">
      <Typography style={{...styles.mono, color: 'white', fontSize: size}}>{name}</Typography>
      {service !== '' && (
        <Typography style={{textTransform: 'lowercase', marginTop: -6, fontSize: 12, color: '#999'}}>
          @{service}
        </Typography>
      )}
    </Box>
  )
}
