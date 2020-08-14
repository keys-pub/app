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

import Snack, {SnackProps} from '../../components/snack'
import SearchView from './view'

import {Key} from '../../rpc/keys.d'

import KeyDialog from '../key'

type Props = {
  open: boolean
  close: () => void
}

type State = {
  openKey: string
  openSnack?: SnackProps
}

export default class SearchDialog extends React.Component<Props, State> {
  state: State = {
    openKey: '',
  }

  select = (k: Key) => {
    this.setState({openKey: k.id || ''})
  }

  render() {
    return (
      <Dialog
        onClose={this.props.close}
        open={this.props.open}
        maxWidth="xl"
        fullWidth
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
          close={(snack: string) =>
            this.setState({
              openKey: '',
              openSnack: snack ? {message: snack, alert: 'success', duration: 4000} : undefined,
            })
          }
          kid={this.state.openKey}
          update
          import
          reload={() => {}}
        />
        <Snack snack={this.state.openSnack} onClose={() => this.setState({openSnack: undefined})} />
      </Dialog>
    )
  }
}
