import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

type Props = {
  loading?: boolean
  children: React.ReactNode
}

export default (props: Props) => {
  return (
    <Box display="flex" flexDirection="column">
      <Typography
        id="alert-dialog-title"
        variant="h5"
        style={{paddingBottom: 7, paddingLeft: 20, paddingTop: 15, fontWeight: 600}}
      >
        {props.children}
      </Typography>
      {!props.loading && <Box style={{marginBottom: 4}} />}
      {props.loading && <LinearProgress />}
    </Box>
  )
}
