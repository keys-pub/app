import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Divider, IconButton, Typography} from '@material-ui/core'

import {ChevronLeft, Lock} from '@material-ui/icons'

import {goBack} from 'connected-react-router'

import {store} from '../store'

type Props = {}

export default (props: Props) => {
  const dark = false
  const color = dark ? 'white' : ''
  const backgroundColor = dark ? '#2f2f2f' : ''

  const back = () => store.dispatch(goBack())
  const lock = () => store.dispatch({type: 'LOCK'})

  return (
    <div className="drag">
      <Box display="flex" flexDirection="column" style={{backgroundColor}}>
        <Box display="flex" flexDirection="row">
          <IconButton
            onClick={back}
            style={{marginTop: -6, marginBottom: -2, marginLeft: -4, height: 41, color}}
          >
            <ChevronLeft />
          </IconButton>
          <Box display="flex" flexGrow={1} />
          <IconButton onClick={lock} style={{marginTop: -6, marginBottom: -2, height: 41}}>
            <Lock />
          </IconButton>
        </Box>
      </Box>
    </div>
  )
}
