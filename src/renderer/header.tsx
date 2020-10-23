import * as React from 'react'

import {Box} from '@material-ui/core'

import {Button, Divider, LinearProgress, IconButton, Typography} from '@material-ui/core'

import {store, goBack} from './store'
import {ipcRenderer} from 'electron'
import {platform} from 'os'

import {BackIcon, CloseIcon, MinimizeIcon, MaximizeIcon, UnmaximizeIcon} from './icons'

type Props = {
  noBack?: boolean
  loading?: boolean
}

export default (props: Props) => {
  const [maximized, setMaximized] = React.useState(false)

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
    <Box display="flex" flexDirection="column" style={{position: 'relative', width: '100%'}}>
      <Box style={{position: 'fixed', top: 0, left: 0, right: 0, width: '100%', zIndex: 10}}>
        {props.loading && <LinearProgress />}
      </Box>
      <Box display="flex" flexDirection="column" style={{position: 'absolute', top: 0, left: 0, right: 0}}>
        <Box display="flex" flexDirection="row" flex={1}>
          {!props.noBack && (
            <Box>
              <IconButton size="small" onClick={goBack} style={{marginLeft: 4, zIndex: 10}}>
                <BackIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <Box display="flex" flexGrow={1} className="drag" style={{height: 20, cursor: 'pointer'}} />
          {showSystemButtons && (
            <Box display="flex" flexDirection="row" style={{zIndex: 10}}>
              <Box>
                <IconButton
                  size="small"
                  onClick={minimize}
                  style={{zIndex: 10, marginRight: 10, marginTop: 1}}
                >
                  <MinimizeIcon fontSize="small" style={{color: '#666'}} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={maximize}
                  style={{zIndex: 10, marginRight: 10, marginTop: 1}}
                >
                  {!maximized && <MaximizeIcon fontSize="small" style={{color: '#666'}} />}
                  {maximized && <UnmaximizeIcon fontSize="small" style={{color: '#666'}} />}
                </IconButton>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={close}
                  style={{marginRight: 4, marginTop: 1, zIndex: 10}}
                >
                  <CloseIcon fontSize="small" style={{color: '#666'}} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
