import * as React from 'react'

import {Typography, Box, Button} from '@material-ui/core'

import UserLabel from '../user/label'
import {styles, Snack, SnackOpts} from '../../components'

import KeyDialog from '../key'

import {Key, EncryptMode} from '../../rpc/keys.d'

type Props = {
  signer: Key
  unsigned?: boolean
  mode?: EncryptMode
  reload: () => void
}

type State = {
  openKey: string
  openSnack?: SnackOpts
}

export default class SignerView extends React.Component<Props, State> {
  state = {
    openKey: '',
    openSnack: null,
  }

  openKey = () => {
    this.setState({openKey: this.props.signer.id})
  }

  closeKey = (snack: string) => {
    this.setState({openKey: '', openSnack: snack ? {message: snack, alert: 'success', duration: 4000} : null})
    this.props.reload()
  }

  renderSigner() {
    if (!this.props.signer) {
      return <NoSigner unsigned={this.props.unsigned} />
    }
    if (!this.props.signer.user) {
      return <SignerUserUnknown signer={this.props.signer} lookup={this.openKey} />
    }
    return <SignerUser signer={this.props.signer} />
  }

  render() {
    return (
      <Box>
        {this.renderSigner()}
        <KeyDialog
          open={!!this.state.openKey}
          close={this.closeKey}
          kid={this.state.openKey}
          search
          update
          import
        />
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

const NoSigner = (props: {unsigned: boolean}) => {
  const {unsigned} = props
  return (
    <Box style={{paddingLeft: 10, paddingTop: 8, paddingBottom: 8, backgroundColor: '#efefef'}}>
      {!unsigned && <Typography display="inline">&nbsp;</Typography>}
      {unsigned && <Typography display="inline">Unsigned</Typography>}
    </Box>
  )
}

const SignerUser = (props: {signer: Key}) => {
  const {signer} = props
  return (
    <Box
      display="flex"
      flexDirection="row"
      style={{paddingLeft: 10, paddingTop: 8, paddingBottom: 8, backgroundColor: '#bbeebb'}}
    >
      <Typography display="inline" style={{...styles.mono}}>
        Verified&nbsp;
      </Typography>
      <UserLabel kid={signer.id} user={signer.user} />
      {/* <Typography display="inline" style={{...styles.mono}}>
        {encryptModeDescription(mode)}
      </Typography> */}
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
      <Typography display="inline" style={{...styles.mono}}>
        Signed by&nbsp;
      </Typography>
      <UserLabel kid={signer.id} user={signer.user} />
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={lookup}
        style={{marginLeft: 6, marginTop: -5}}
      >
        Lookup
      </Button>

      {/* <Typography display="inline" style={{...styles.mono}}>
          {encryptModeDescription(mode)}
        </Typography> */}
    </Box>
  )
}

const encryptModeDescription = (m: EncryptMode): string => {
  switch (m) {
    case EncryptMode.SALTPACK_ENCRYPT:
      return ' (saltpack encrypt)'
    case EncryptMode.SALTPACK_SIGNCRYPT:
      return ' (saltpack signcrypt)'
    default:
      return ''
  }
}
