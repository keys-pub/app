import * as React from 'react'
import {CSSProperties} from 'react'
import {Box, Typography} from '@material-ui/core'

import {Link} from '../components'

import UserLabel from '../user/label'

import {Key, KeyType, User} from '../rpc/keys.d'

type IDLabelProps = {
  k: Key
  owner?: boolean
  style?: CSSProperties
}

export const IDLabel = (props: IDLabelProps) => {
  const key = props.k
  const isPrivate = key.type == KeyType.X25519 || key.type === KeyType.EDX25519
  let style: CSSProperties = {}
  if (props.owner && isPrivate) style.fontWeight = 500
  // width: 520, wordWrap: 'break-word', wordBreak: 'break-all'
  if (props.style) style = {...style, ...props.style}
  return (
    <Typography variant="body2" style={{...style}}>
      {key.id}
    </Typography>
  )
}

export const KeyLabel = (props: {k: Key; full?: boolean}) => {
  if (props.full) {
    return (
      <Box>
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
