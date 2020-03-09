import * as React from 'react'

import {Button, Input, Box, Snackbar, SnackbarContent} from '@material-ui/core'

import {styles} from '../../components'

import {store} from '../../store'

import {clipboard} from 'electron'

import {debounce} from 'lodash'

import {sign} from '../../rpc/rpc'

import {RPCError, SignRequest, SignResponse} from '../../rpc/types'

export type Props = {
  value: string
  signer: string
}

type State = {
  error: string
  signed: string
  snackOpen: boolean
}

export default class SignedView extends React.Component<Props, State> {
  state = {
    signed: '',
    error: '',
    snackOpen: false,
  }
  debounceSign = debounce(() => this.sign(), 10)

  componentDidMount() {
    this.sign()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.value != prevProps.value || this.props.signer != prevProps.signer) {
      this.debounceSign()
    }
  }

  sign = () => {
    this.setState({error: '', signed: ''})

    if (this.props.signer == '' || this.props.value == '') {
      return
    }

    this.setState({error: '', signed: ''})
    const data = new TextEncoder().encode(this.props.value)
    const req: SignRequest = {
      data: data,
      armored: true,
      signer: this.props.signer,
    }
    sign(req, (err: RPCError, resp: SignResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      const signed = new TextDecoder('ascii').decode(resp.data)
      this.setState({error: '', signed})
    })
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.signed)
    this.setState({snackOpen: true})
  }

  render() {
    return (
      <Box style={{width: '100%', height: '100%', position: 'relative'}}>
        <Input
          multiline
          readOnly
          value={this.state.signed}
          disableUnderline
          inputProps={{
            style: {
              ...styles.mono,
              height: '100%',
            },
          }}
          style={{
            height: '100%',
            width: '100%',
            paddingLeft: 10,
            paddingTop: 10,
            overflowY: 'scroll',
          }}
        />
        <Box style={{position: 'absolute', right: 20, bottom: 6}}>
          <Button size="small" variant="outlined" onClick={this.copyToClipboard}>
            Copy to Clipboard
          </Button>
        </Box>
        <Snackbar
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          open={this.state.snackOpen}
          autoHideDuration={2000}
          onClose={() =>
            this.setState({
              snackOpen: false,
            })
          }
        >
          <SnackbarContent
            aria-describedby="client-snackbar"
            message={<span id="client-snackbar">Copied to Clipboard</span>}
          />
        </Snackbar>
      </Box>
    )
  }
}
