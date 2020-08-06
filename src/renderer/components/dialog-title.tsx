import * as React from 'react'

import {Box, IconButton, LinearProgress, Typography} from '@material-ui/core'
import {Close as CloseIcon} from '@material-ui/icons'

type Props = {
  loading?: boolean
  children: React.ReactNode
  onClose?: () => void
}

export default (props: Props) => {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexGrow={1} flexDirection="row">
        <Typography
          id="alert-dialog-title"
          variant="h5"
          style={{paddingBottom: 7, paddingLeft: 20, paddingTop: 15, fontWeight: 600}}
        >
          {props.children}
        </Typography>
        <Box display="flex" flex={1} flexGrow={1} flexDirection="row" />
        {props.onClose && (
          <Box style={{marginTop: 12, marginRight: 10}}>
            <IconButton size="small" aria-label="close" color="inherit" onClick={props.onClose}>
              <CloseIcon fontSize="small" style={{color: '#999999'}} />
            </IconButton>
          </Box>
        )}
      </Box>
      {!props.loading && <Box style={{marginBottom: 4}} />}
      {props.loading && <LinearProgress />}
    </Box>
  )
}
