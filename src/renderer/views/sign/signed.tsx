import * as React from 'react'

import {Button, Input, Box, Snackbar, SnackbarContent} from '@material-ui/core'

import {styles} from '../../components'

import {store} from '../../store'

import {clipboard} from 'electron'

import {sign, RPCError} from '../../rpc/rpc'

import {Key, SignRequest, SignResponse} from '../../rpc/types'

export type Props = {
  value: string
  kid: string
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
  // debounceSign = debounce(() => this.sign(), 10)

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.sign()
    }
  }

  sign = () => {
    this.setState({error: '', signed: ''})

    if (this.props.kid == '' || this.props.value == '') {
      return
    }

    this.setState({error: '', signed: ''})
    const data = new TextEncoder().encode(this.props.value)
    const req: SignRequest = {
      data: data,
      armored: true,
      kid: this.props.kid,
    }
    store.dispatch(
      sign(
        req,
        (resp: SignResponse) => {
          const signed = new TextDecoder('ascii').decode(resp.data)
          this.setState({error: '', signed})
        },
        (err: RPCError) => {
          this.setState({error: err.details})
        }
      )
    )
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
