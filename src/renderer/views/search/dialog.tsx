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
  Snackbar,
  TextField,
  Typography,
} from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import {styles, DialogTitle} from '../../components'
import SearchView from './view'

import {RPCError, Key} from '../../rpc/keys.d'

import KeyDialog from '../key'

type Props = {
  open: boolean
  close: () => void
}

type State = {
  openKey: string
  openSnack: string
}

export default class SearchDialog extends React.Component<Props, State> {
  state = {
    openKey: '',
    openSnack: '',
  }

  select = (k: Key) => {
    this.setState({openKey: k.id})
  }

  render() {
    return (
      <Dialog
        onClose={this.props.close}
        open={this.props.open}
        maxWidth="xl"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        // keepMounted
      >
        <DialogContent
          dividers
          style={{
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: 0,
            height: 400,
          }}
        >
          <SearchView select={this.select} />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
        <KeyDialog
          open={this.state.openKey != ''}
          close={(snack: string) => this.setState({openKey: '', openSnack: snack})}
          kid={this.state.openKey}
          // update={true}
          source="search"
          refresh={() => {}}
        />
        <Snack
          open={this.state.openSnack != ''}
          close={() => this.setState({openSnack: ''})}
          description={this.state.openSnack}
        />
      </Dialog>
    )
  }
}

const Snack = (props: {description: string; open: boolean; close: () => void}) => {
  return (
    <Snackbar
      anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      open={props.open}
      autoHideDuration={2000}
      onClose={props.close}
    >
      <Alert severity="success">
        <Typography>{props.description}</Typography>
      </Alert>
    </Snackbar>
  )
}
