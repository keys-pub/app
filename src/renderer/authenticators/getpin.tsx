import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  LinearProgress,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {DialogTitle} from '../components/dialog'

type Props = {
  open: boolean
  cancel: () => void
  select: (pin: string) => void
}

type State = {
  error?: Error
  pin: string
  loading: boolean
}

export default class GetPinDialog extends React.Component<Props, State> {
  state: State = {
    pin: '',
    loading: false,
  }

  reset = () => {
    this.setState({error: undefined, pin: '', loading: false})
  }

  cancel = () => {
    this.reset()
    this.props.cancel()
  }

  select = () => {
    const pin = this.state.pin
    this.reset()
    this.props.select(pin)
  }

  onPinChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({pin: target.value, error: undefined})
  }

  renderPinChange() {
    return (
      <Box display="flex" flexDirection="column">
        <Typography style={{paddingBottom: 20}}>Enter the PIN.</Typography>
        <FormControl error={!!this.state.error}>
          <TextField variant="outlined" label="PIN" onChange={this.onPinChange} value={this.state.pin} />
          <FormHelperText>{this.state.error?.message || ' '}</FormHelperText>
        </FormControl>
      </Box>
    )
  }

  render() {
    return (
      <Dialog
        onClose={this.cancel}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogTitle loading={this.state.loading} onClose={this.cancel}>
          PIN
        </DialogTitle>
        <DialogContent>{this.renderPinChange()}</DialogContent>
        <DialogActions>
          <Button onClick={this.cancel}>Cancel</Button>
          <Button color="primary" onClick={this.select}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
