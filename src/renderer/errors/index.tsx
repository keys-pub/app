import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles, DialogTitle} from '../components'

import {Store} from '../store/pull'

import {ipcRenderer} from 'electron'
import ErrorDialog from './dialog'

const restart = () => {
  ipcRenderer.send('reload-app', {})
}

export default (_: {}) => {
  const {error} = Store.useState((s) => ({
    error: s.error,
  }))

  const clear = () => {
    Store.update((s) => {
      s.error = undefined
    })
  }

  if (!error) return null
  return <ErrorDialog error={error} clear={clear} restart={restart} />
}
