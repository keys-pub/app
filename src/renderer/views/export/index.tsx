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

import {styles, Step} from '../../components'

import {keyExport} from '../../rpc/rpc'
import {goBack, push} from 'connected-react-router'

import {query} from '../state'

import {store} from '../../store'

import {connect} from 'react-redux'

import {RPCState} from '../../rpc/rpc'
import {Key, KeyExportRequest, KeyExportResponse} from '../../rpc/types'

type Props = {
  kid: string
}

type State = {
  export: string
  password: string
  error: string
}

class KeyExportView extends React.Component<Props, State> {
  state = {
    export: '',
    password: '',
    error: '',
  }

  export = () => {
    const req: KeyExportRequest = {kid: this.props.kid, password: this.state.password}
    store.dispatch(
      keyExport(req, (resp: KeyExportResponse) => {
        const out = new TextDecoder().decode(resp.export)
        this.setState({export: out})
      })
    )
  }

  back = () => {
    if (this.state.export === '') {
      store.dispatch(goBack())
    } else {
      this.setState({export: ''})
    }
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({password: target ? target.value : '', error: ''})
  }

  renderExport() {
    return (
      <Box>
        <Typography style={{paddingBottom: 10}}>Export your key encrypted with your password.</Typography>
        <Typography style={{...styles.mono, paddingBottom: 20}}>{this.props.kid}</Typography>
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
          <Button color="secondary" variant="outlined" onClick={this.back}>
            Back
          </Button>
          <Box style={{width: 20}} />
          <Button color="primary" variant="outlined" onClick={this.export}>
            Export
          </Button>
        </Box>
      </Box>
    )
  }

  renderExported() {
    return (
      <Box>
        {/* <Typography style={{paddingBottom: 10}}></Typography> */}
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
            width: 500,
          }}
        >
          {this.state.export}
        </Typography>
        <Box display="flex" flexDirection="row">
          <Button color="secondary" variant="outlined" onClick={this.back}>
            Back
          </Button>
        </Box>
      </Box>
    )
  }

  render() {
    return (
      <Step title="Export Key">
        {this.state.export == '' && this.renderExport()}
        {this.state.export !== '' && this.renderExported()}
      </Step>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: query(state, 'kid'),
  }
}

export default connect(mapStateToProps)(KeyExportView)
