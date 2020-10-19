import * as React from 'react'
import {CSSProperties} from 'react'
import {Box, Typography} from '@material-ui/core'

import {Link} from '../components'

import UserLabel from '../user/label'

import {Key, KeyType, User} from '@keys-pub/tsclient/lib/keys.d'

type IDLabelProps = {
  k: Key
  em?: boolean
  style?: CSSProperties
}

export const isKeyPrivate = (key: Key): boolean => {
  return key.type == KeyType.X25519 || key.type == KeyType.EDX25519
}

export const IDLabel = (props: IDLabelProps) => {
  const key = props.k
  const isPrivate = isKeyPrivate(key)
  let style: CSSProperties = {}
  if (isPrivate && props.em) style.fontWeight = 500
  // width: 520, wordWrap: 'break-word', wordBreak: 'break-all'
  if (props.style) style = {...style, ...props.style}
  return (
    <Typography display="inline" variant="body2" style={{...style}}>
      {key.id}
    </Typography>
  )
}

export const KeyLabel = (props: {k: Key; full?: boolean}) => {
  if (props.full) {
    return (
      <Box display="flex" flexDirection="column">
        {props.k.user && <UserLabel user={props.k.user} />}
        <IDLabel k={props.k} />
      </Box>
    )
  }

  if (props.k.user) {
    return <UserLabel user={props.k.user} />
  }
  return <IDLabel k={props.k} />
}
