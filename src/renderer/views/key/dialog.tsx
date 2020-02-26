import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Slide,
  Typography,
} from '@material-ui/core'

import {TransitionProps} from '@material-ui/core/transitions'

import {store} from '../../store'

import {styles, DialogTitle, Link} from '../../components'
import UserSignDialog from '../user/dialog'
import ServiceSelect from '../user/service-select'

import {shell} from 'electron'

import {keyGenerate} from '../../rpc/rpc'
import {KeyGenerateRequest, KeyGenerateResponse, KeyType} from '../../rpc/types'

type Props = {
  open: boolean
  close: () => void
}

type State = {
  loading: boolean
}

const transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const minHeight = 125

export default class KeyDialog extends React.Component<Props> {
  state = {
    loading: false,
  }

  close = () => {
    this.props.close()
  }

  render() {
    return (
      <Dialog
        onClose={this.close}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle loading={this.state.loading}>Key</DialogTitle>
        <DialogContent dividers>
          <Box></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
