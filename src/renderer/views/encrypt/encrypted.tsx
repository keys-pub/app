import * as React from 'react'

import {connect} from 'react-redux'

import {
  Button,
  Divider,
  LinearProgress,
  Input,
  Typography,
  Snackbar,
  SnackbarContent,
  Box,
} from '@material-ui/core'

import {styles} from '../../components'

import {store} from '../../store'

import {debounce} from 'lodash'

import {clipboard} from 'electron'

import {encrypt} from '../../rpc/keys'
import {RPCError, Key, EncryptRequest, EncryptResponse} from '../../rpc/keys.d'
import {CSSProperties} from '@material-ui/styles'

export type Props = {
  value: string
  recipients: string[]
  sender: string
}

type State = {
  encrypted: string
  error: string
  snackOpen: boolean
}

// TODO: drag and drop file

export default class EncryptedView extends React.Component<Props, State> {
  state = {
    encrypted: '',
    error: '',
    snackOpen: false,
  }

  debounceEncrypt = debounce(() => this.encrypt(), 10)

  componentDidMount() {
    this.encrypt()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.value != prevProps.value ||
      this.props.sender != prevProps.sender ||
      this.props.recipients != prevProps.recipients
    ) {
      this.debounceEncrypt()
    }
  }

  encrypt = async () => {
    this.setState({error: '', encrypted: ''})

    if (this.props.recipients.length == 0 || this.props.value == '') {
      return
    }

    const data = new TextEncoder().encode(this.props.value)
    const req: EncryptRequest = {
      data: data,
      armored: true,
      recipients: this.props.recipients,
      sender: this.props.sender,
    }
    encrypt(req, (err: RPCError, resp: EncryptResponse) => {
      if (err) {
        this.setState({error: err.details})
        return
      }
      const encrypted = new TextDecoder().decode(resp.data)
      this.setState({error: '', encrypted: encrypted})
    })
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.encrypted)
    this.setState({snackOpen: true})
  }

  render() {
    let value = ''
    let stylesInput: CSSProperties = {}
    const disabled = !this.state.encrypted
    if (this.state.error) {
      value = this.state.error
      stylesInput.color = 'red'
    } else {
      value = this.state.encrypted
    }

    return (
      <Box style={{width: '100%', height: '100%', position: 'relative'}}>
        <Input
          multiline
          readOnly
          value={value}
          disableUnderline
          inputProps={{
            style: {
              ...styles.mono,
              ...stylesInput,
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
