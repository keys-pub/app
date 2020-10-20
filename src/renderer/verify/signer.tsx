import * as React from 'react'

import {Typography, Box, Button} from '@material-ui/core'

import UserLabel from '../user/label'

import Snack, {SnackProps} from '../components/snack'

import KeyDialog from '../key'

import {Key, EncryptMode} from '@keys-pub/tsclient/lib/keys'
import {KeyLabel} from '../key/label'
import {column2Color} from '../theme'

type Props = {
  signer?: Key
  unsigned?: boolean
  mode?: EncryptMode
  reload: (kid: string) => void
}

type State = {
  keyOpen: boolean
  keyShow?: Key
  snack?: SnackProps
  snackOpen: boolean
}

export default class SignerView extends React.Component<Props, State> {
  state: State = {
    keyOpen: false,
    snackOpen: false,
  }

  openKey = () => {
    this.setState({keyOpen: true, keyShow: this.props.signer})
  }

  closeKey = (snack: string) => {
    this.setState({
      keyOpen: false,
      snack: {message: snack, alert: 'success', duration: 4000},
      snackOpen: !!snack,
    })
    if (this.state.keyShow?.id) {
      this.props.reload(this.state.keyShow?.id)
    }
  }

  renderSigner() {
    if (!this.props.signer) {
      return <NoSigner unsigned={!!this.props.unsigned} />
    }
    if (!this.props.signer?.user) {
      return <SignerUserUnknown signer={this.props.signer} lookup={this.openKey} />
    }
    return <SignerUser signer={this.props.signer} mode={this.props.mode} />
  }

  render() {
    return (
      <Box>
        {this.renderSigner()}
        {this.state.keyShow && (
          <KeyDialog
            open={this.state.keyOpen}
            close={this.closeKey}
            kid={this.state.keyShow?.id!}
            search
            update
            import
          />
        )}
        <Snack
          open={this.state.snackOpen}
          {...this.state.snack}
          onClose={() => this.setState({snackOpen: false})}
        />
      </Box>
    )
  }
}

const NoSigner = (props: {unsigned: boolean}) => {
  const {unsigned} = props
  return (
    <Box
      style={{
        paddingLeft: 10,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: unsigned ? '#eeeebb' : column2Color,
      }}
    >
      {!unsigned && <Typography display="inline">&nbsp;</Typography>}
      {unsigned && <Typography display="inline">Unsigned</Typography>}
    </Box>
  )
}

const SignerUser = (props: {signer: Key; mode?: EncryptMode}) => {
  const {signer, mode} = props
  return (
    <Box
      display="flex"
      flexDirection="row"
      style={{paddingLeft: 10, paddingTop: 8, paddingBottom: 8, backgroundColor: '#bbeebb'}}
    >
      <Typography display="inline" variant="body2">
        Verified&nbsp;
      </Typography>
      <KeyLabel k={signer} />
      <Typography display="inline" variant="body2">
        {encryptModeDescription(mode)}
      </Typography>
    </Box>
  )
}

const SignerUserUnknown = (props: {signer: Key; lookup: () => void}) => {
  const {signer, lookup} = props
  return (
    <Box
      display="flex"
      flexDirection="row"
      style={{paddingLeft: 10, paddingTop: 12, paddingBottom: 6, backgroundColor: '#eeeebb'}}
    >
      <Typography display="inline" variant="body2">
        Signed by&nbsp;
      </Typography>
      <KeyLabel k={signer} />
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={lookup}
        style={{marginLeft: 6, marginTop: -5}}
      >
        Lookup
      </Button>
    </Box>
  )
}

const encryptModeDescription = (mode?: EncryptMode): string => {
  switch (mode) {
    case EncryptMode.SALTPACK_ENCRYPT:
      return ' (Saltpack Encrypt)'
    case EncryptMode.SALTPACK_SIGNCRYPT:
      return ' (Saltpack Signcrypt)'
    default:
      return ''
  }
}
