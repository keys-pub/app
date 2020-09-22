import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Divider, LinearProgress, IconButton, Typography} from '@material-ui/core'

import {store, goBack} from './store'
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

import {authLock} from './rpc/keys'

type Props = {
  noLock?: boolean
  noBack?: boolean
  loading?: boolean
}

export default (props: Props) => {
  const [maximized, setMaximized] = React.useState(false)

  const lock = async () => {
    ipcRenderer.send('authToken', {authToken: ''})
    store.update((s) => {
      s.unlocked = false
    })
    await authLock({})
  }

  const osname = platform()

  let showSystemButtons = true
  if (osname == 'darwin') {
    showSystemButtons = false
  }

  const close = () => {
    console.log('Close')
    ipcRenderer.send('window-close')
  }

  const minimize = () => {
    console.log('Minimize')
    ipcRenderer.send('window-minimize')
  }

  const maximize = async () => {
    console.log('Maximize')
    const maximized: boolean = await ipcRenderer.invoke('window-maximize')
    setMaximized(maximized)
  }

  React.useEffect(() => {
    const isMaximized = async () => {
      const maximized: boolean = await ipcRenderer.invoke('window-isMaximized')
      setMaximized(maximized)
    }
    isMaximized()
  }, [])

  return (
    <Box display="flex" flexDirection="column" style={{width: '100%'}}>
      <Box display="flex" flexDirection="column" style={{height: 28}}>
        <Box style={{position: 'fixed', top: 0, width: '100%'}}>{props.loading && <LinearProgress />}</Box>
        <Box display="flex" flexDirection="row">
          {!props.noBack && (
            <Box display="flex" flexDirection="row">
              <IconButton onClick={goBack} style={{marginTop: -6, marginBottom: -2, height: 41}}>
                <ChevronLeft />
              </IconButton>
            </Box>
          )}
          <Box display="flex" flexGrow={1} className="drag" />
          {!props.noLock && (
            <IconButton onClick={lock} style={{marginTop: -6, marginBottom: -2, height: 41}} id="lockButton">
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
