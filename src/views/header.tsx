import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Divider, IconButton, Typography} from '@material-ui/core'

import {ChevronLeft} from '@material-ui/icons'

type Props = {
  goBack: () => void
}

export default (props: Props) => {
  const dark = false
  const color = dark ? 'white' : ''
  const backgroundColor = dark ? '#2f2f2f' : ''

  return (
    <Box display="flex" flexDirection="column" style={{backgroundColor}}>
      <Box display="flex" flexDirection="row">
        <IconButton
          onClick={props.goBack}
          style={{marginTop: -6, marginBottom: -2, marginLeft: -4, height: 41, color}}
        >
          <ChevronLeft />
        </IconButton>
      </Box>
    </Box>
  )
}
