import * as React from 'react'

import {Typography, Box} from '@material-ui/core'

import {Key, EncryptMode} from '../../rpc/keys.d'

import UserLabel from '../user/label'
import {styles} from '../../components'

export type Props = {
  mode?: EncryptMode
  signer: Key
  unsigned?: boolean
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

export default class SignerView extends React.Component<Props> {
  render() {
    const {signer, mode, unsigned} = this.props
    let backgroundColor = signer ? '#bbeebb' : '#efefef'
    if (unsigned) {
      backgroundColor = '#eeeebb'
    }
    return (
      <Box style={{paddingLeft: 10, paddingTop: 8, paddingBottom: 8, backgroundColor}}>
        {this.props.signer && (
          <Box display="inline">
            <Typography display="inline" style={{...styles.mono}}>
              Verified&nbsp;
            </Typography>
            <UserLabel kid={signer.id} user={signer.user} />
            <Typography display="inline" style={{...styles.mono}}>
              {encryptModeDescription(mode)}
            </Typography>
          </Box>
        )}
        {!this.props.signer && !unsigned && <Typography display="inline">&nbsp;</Typography>}
        {!this.props.signer && unsigned && <Typography display="inline">Unsigned</Typography>}
      </Box>
    )
  }
}
