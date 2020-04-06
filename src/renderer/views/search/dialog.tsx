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

import {styles, DialogTitle} from '../../components'
import SearchView from './view'

import {RPCError, Key} from '../../rpc/types'

import KeyDialog from '../key'

type Props = {
  open: boolean
  close: () => void
}

type State = {
  openKey: string
}

export default class SearchDialog extends React.Component<Props, State> {
  state = {
    openKey: '',
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
          style={{paddingTop: 20, paddingLeft: 0, paddingRight: 0, paddingBottom: 0, height: 400}}
        >
          <SearchView select={this.select} tableHeight="calc(100vh - 246px)" />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
        <KeyDialog
          open={this.state.openKey != ''}
          close={() => this.setState({openKey: ''})}
          kid={this.state.openKey}
          update={true}
          source="search"
          refresh={() => {}}
        />
      </Dialog>
    )
  }
}
