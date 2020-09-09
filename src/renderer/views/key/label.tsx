import * as React from 'react'
import {CSSProperties} from 'react'
import {Box, Typography} from '@material-ui/core'

import {styles, Link} from '../../components'
import UserLabel from '../user/label'

import {Key, KeyType, User} from '../../rpc/keys.d'

export const IDLabel = (props: {k: Key; owner?: boolean}) => {
  const key = props.k
  const isPrivate = key.type == KeyType.X25519 || key.type === KeyType.EDX25519
  const style: CSSProperties = {}
  if (props.owner && isPrivate) style.fontWeight = 500
  // width: 520, wordWrap: 'break-word', wordBreak: 'break-all'
  return <Typography style={{...styles.mono, ...style}}>{key.id}</Typography>
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
