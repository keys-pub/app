import * as React from 'react'

import {Button, Input, Box} from '@material-ui/core'
import {styles, Snack} from '../../components'
import {clipboard} from 'electron'
import {debounce} from 'lodash'
import {sign} from '../../rpc/keys'
import {RPCError, SignRequest, SignResponse} from '../../rpc/keys.d'

export type Props = {
  value: string
  signer: string
}

type State = {
  error: string
  signed: string
  openSnack: boolean
}

export default class SignedView extends React.Component<Props, State> {
  state = {
    signed: '',
    error: '',
    openSnack: false,
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
    this.setState({openSnack: true})
  }

  render() {
    const disabled = !this.state.signed
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
              overflow: 'auto',
              paddingTop: 0,
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
          open={this.state.openSnack}
          duration={2000}
          onClose={() => this.setState({openSnack: false})}
          message="Copied to Clipboard"
        />
      </Box>
    )
  }
}
