import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Divider, IconButton, Typography} from '@material-ui/core'

import {store} from '../store'
import {ipcRenderer} from 'electron'
import {platform} from 'os'

import {
  ChevronLeft,
  NotInterested as ScreenLockIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Crop75 as UnmaximizeIcon,
} from '@material-ui/icons'

import {history} from './router'
import {remote} from 'electron'

type Props = {
  noLock?: boolean
  noBack?: boolean
}

export default (props: Props) => {
  const win = remote.getCurrentWindow()
  const [maximized, setMaximized] = React.useState(win.isMaximized())

  const back = () => {
    history.back()
  }

  const lock = () => {
    ipcRenderer.send('authToken', {authToken: ''})
    store.update((s) => {
      s.unlocked = false
    })
  }

  const osname = platform()

  let showSystemButtons = true
  if (osname == 'darwin') {
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
    <Box display="flex" flexDirection="column" style={{width: '100%'}}>
      <Box display="flex" flexDirection="column" style={{height: 28}}>
        <Box display="flex" flexDirection="row">
          {!props.noBack && (
            <Box display="flex" flexDirection="row">
              <IconButton onClick={back} style={{marginTop: -6, marginBottom: -2, height: 41}}>
                <ChevronLeft />
              </IconButton>
            </Box>
          )}
          <Box display="flex" flexGrow={1} className="drag" />
          {!props.noLock && (
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
    </Box>
  )
}
