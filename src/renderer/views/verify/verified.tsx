import * as React from 'react'

import {Box, Button, Divider, Input} from '@material-ui/core'

import {clipboard} from 'electron'

import {Snack, SnackOpts} from '../../components'
import SignerView from './signer'

import {verify} from '../../rpc/keys'
import {RPCError, Key, VerifyRequest, VerifyResponse} from '../../rpc/keys.d'

export type Props = {
  value: string
}

type State = {
  verified: string
  signer: Key
  error: string
  openSnack?: SnackOpts
}

export default class VerifiedView extends React.Component<Props, State> {
  state = {
    signer: null,
    verified: '',
    error: '',
    openSnack: null,
  }

  componentDidMount() {
    this.verify()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      this.verify()
    }
  }

  verify = () => {
    console.log('Verify...')
    this.setState({error: '', signer: null, verified: ''})

    if (this.props.value == '') return

    const data = new TextEncoder().encode(this.props.value)
    const req: VerifyRequest = {
      data: data,
    }
    verify(req, (err: RPCError, resp: VerifyResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      const verified = new TextDecoder().decode(resp.data)
      this.setState({error: '', signer: resp.signer, verified})
    })
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.verified)
    this.setState({openSnack: {message: 'Copied to Clipboard', duration: 2000}})
  }

  render() {
    const disabled = !this.state.verified
    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
        <SignerView signer={this.state.signer} reload={this.verify} />
        <Divider />
        <Input
          multiline
          readOnly
          value={this.state.verified}
          disableUnderline
          inputProps={{
            style: {
              height: '100%',
              overflow: 'auto',
              paddingTop: 8,
              paddingLeft: 8,
              paddingBottom: 0,
              paddingRight: 0,
            },
          }}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
        <Box style={{position: 'absolute', right: 20, bottom: 6}}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            disabled={disabled}
            onClick={this.copyToClipboard}
            style={{backgroundColor: 'white'}}
          >
            Copy to Clipboard
          </Button>
        </Box>
        <Snack
          open={!!this.state.openSnack}
          message={this.state.openSnack?.message}
          duration={this.state.openSnack?.duration}
          alert={this.state.openSnack?.alert}
          onClose={() => this.setState({openSnack: null})}
        />
      </Box>
    )
  }
}
