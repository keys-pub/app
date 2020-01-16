import * as React from 'react'

import {
  Box,
  Button,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'

import {styles, Step} from '../components'

import {keyExport} from '../../rpc/rpc'
import {goBack, push} from 'connected-react-router'

import {selectedKID} from '../state'

import {connect} from 'react-redux'

import {RPCState} from '../../rpc/rpc'
import {Key, KeyExportRequest, KeyExportResponse} from '../../rpc/types'

type Props = {
  kid: string
  dispatch: (action: any) => any
}

type State = {
  keyBackup: string
  password: string
  error: string
}

class KeyExportView extends React.Component<Props, State> {
  state = {
    keyBackup: '',
    password: '',
    error: '',
  }

  keyBackup = () => {
    const req: KeyExportRequest = {kid: this.props.kid, password: this.state.password}
    this.props.dispatch(
      keyExport(req, (resp: KeyExportResponse) => {
        const keyBackup = new TextDecoder('ascii').decode(resp.export)
        this.setState({keyBackup: keyBackup})
      })
    )
  }

  back = () => {
    this.props.dispatch(goBack())
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: ''})
  }

  render() {
    return (
      <Step title="Key Backup">
        <Typography style={{paddingBottom: 20}}>Enter in a password to encrypt your key:</Typography>
        <FormControl error={this.state.error !== ''}>
          <TextField
            autoFocus
            label="Password"
            variant="outlined"
            type="password"
            onChange={this.onInputChange}
            value={this.state.password}
            style={{width: 400}}
          />
          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
        </FormControl>
        <Box display="flex" flexDirection="row">
          <Button color="primary" variant="outlined" onClick={this.keyBackup}>
            Encrypt
          </Button>
        </Box>
        {this.state.keyBackup !== '' && (
          <Box>
            <Typography style={{paddingTop: 20, paddingBottom: 20}}>
              This is your key backup encrypted with your password:
            </Typography>
            <Typography
              style={{
                ...styles.mono,
                marginBottom: 20,
                backgroundColor: 'black',
                color: 'white',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              {this.state.keyBackup}
            </Typography>
            <Box display="flex" flexDirection="row">
              <Button color="secondary" variant="outlined" onClick={this.back}>
                Back
              </Button>
            </Box>
          </Box>
        )}
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: selectedKID(state),
  }
}

export default connect(mapStateToProps)(KeyExportView)
