import * as React from 'react'

import {Typography, Box} from '@material-ui/core'

import {Key} from '../../rpc/types'

import KeyRowView from '../key/row'
import {styles} from '../../components'

export type Props = {
  signer: Key
}

export default class SignerView extends React.Component<Props> {
  render() {
    const backgroundColor = this.props.signer ? '#bbeebb' : '#efefef'
    return (
      <Box style={{paddingLeft: 10, paddingTop: 8, paddingBottom: 8, backgroundColor}}>
        {this.props.signer && (
          <Box display="inline">
            <Typography display="inline" style={{...styles.mono}}>
              Verified&nbsp;
            </Typography>
            <KeyRowView value={this.props.signer} />
          </Box>
        )}
        {!this.props.signer && <Typography display="inline">&nbsp;</Typography>}
      </Box>
    )
  }
}
