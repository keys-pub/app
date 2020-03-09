import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Divider, IconButton, Typography} from '@material-ui/core'

import {
  ChevronLeft,
  NotInterested as ScreenLockIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Crop75 as UnmaximizeIcon,
} from '@material-ui/icons'

import {goBack} from 'connected-react-router'

import {store} from '../store'

import {remote} from 'electron'
import {lock} from './state'

type Props = {
  lock?: boolean
  back?: boolean
  navMinimize?: boolean
}

export default (props: Props) => {
  const win = remote.getCurrentWindow()
  const [maximized, setMaximized] = React.useState(win.isMaximized())

  const dark = false
  const color = dark ? 'white' : ''
  const backgroundColor = dark ? '#2f2f2f' : ''

  const back = () => store.dispatch(goBack())

  let showSystemButtons = true
  if (process.platform == 'darwin') {
    showSystemButtons = false
  }

  const close = () => {
    console.log('Close')
    const win = remote.getCurrentWindow()
    win.close()
  }

  const minimize = () => {
    console.log('Minimize')
    const win = remote.getCurrentWindow()
    win.minimize()
  }

  const maximize = () => {
    console.log('Maximize')
    const win = remote.getCurrentWindow()
    setMaximized(!win.isMaximized())
    win.isMaximized() ? win.unmaximize() : win.maximize()
  }

  return (
    <Box display="flex" className="drag" flexDirection="column" style={{backgroundColor}}>
      <Box display="flex" flexDirection="row">
        {props.back && (
          <Box display="flex" flexDirection="row">
            <Box style={{width: props.navMinimize ? 68 : 140}} />
            <IconButton onClick={back} style={{marginTop: -6, marginBottom: -2, height: 41, color}}>
              <ChevronLeft />
            </IconButton>
          </Box>
        )}
        <Box display="flex" flexGrow={1} />
        {props.lock && (
          <IconButton onClick={lock} style={{marginTop: -6, marginBottom: -2, height: 41}}>
            <ScreenLockIcon fontSize="small" style={{fontSize: 14, color: '#666'}} />
          </IconButton>
        )}
        {showSystemButtons && (
          <Box>
            <IconButton onClick={minimize} style={{marginTop: -6, marginBottom: -2, height: 41}}>
              <MinimizeIcon fontSize="small" style={{color: '#666'}} />
            </IconButton>
            <IconButton onClick={maximize} style={{marginTop: -6, marginBottom: -2, height: 41}}>
              {!maximized && <MaximizeIcon fontSize="small" style={{color: '#666'}} />}
              {maximized && <UnmaximizeIcon fontSize="small" style={{color: '#666'}} />}
            </IconButton>
            <IconButton
              color="secondary"
              onClick={close}
              style={{marginTop: -6, marginBottom: -2, height: 41}}
            >
              <CloseIcon fontSize="small" style={{color: '#666'}} />
            </IconButton>
          </Box>
        )}
        {!showSystemButtons && <Box style={{marginTop: -6, marginBottom: -2, height: 41}} />}
      </Box>
    </Box>
  )
}
