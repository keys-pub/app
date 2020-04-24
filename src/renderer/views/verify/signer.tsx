import * as React from 'react'

import {Typography, Box} from '@material-ui/core'

import {Key} from '../../rpc/keys.d'

import UserLabel from '../user/label'
import {styles} from '../../components'

export type Props = {
  signer: Key
  unsigned?: boolean
}

export default class SignerView extends React.Component<Props> {
  render() {
    const {signer, unsigned} = this.props
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
          </Box>
        )}
        {!this.props.signer && !unsigned && <Typography display="inline">&nbsp;</Typography>}
        {!this.props.signer && unsigned && <Typography display="inline">Unsigned</Typography>}
      </Box>
    )
  }
}
