import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

import Link from '../../components/link'

export type Action = {
  label: string
  action: () => void
}

type Props = {
  actions?: Action[]
}

export default (props: Props) => {
  const actions = props.actions || []
  return (
    <Box style={{marginTop: 20}} display="flex" flexDirection="row">
      {actions.map((a: Action, i: number) => (
        <Box key={a.label}>
          <Link inline onClick={a.action}>
            {a.label}
          </Link>
          {i + 1 < actions.length && (
            <Typography display="inline" style={{paddingLeft: 6, paddingRight: 6, color: '#aaa'}}>
              {'—'}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}
