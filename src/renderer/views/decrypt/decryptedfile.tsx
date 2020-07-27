import * as React from 'react'

import {Button, Divider, Input, Box, Snackbar, SnackbarContent, Typography} from '@material-ui/core'

import {styles, Link} from '../../components'

import SignerView from '../verify/signer'

import {shell} from 'electron'
import {dirname} from 'path'

import {Key, EncryptMode} from '../../rpc/keys.d'

export type Props = {
  fileOut: string
  sender: Key
  mode: EncryptMode
  error: string
}

type State = {}

export default class DecryptedFileView extends React.Component<Props, State> {
  openFolder = () => {
    shell.showItemInFolder(this.props.fileOut)
  }

  render() {
    const unsigned = this.props.fileOut && !this.props.sender

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
        {this.props.error && (
          <Box style={{paddingLeft: 10, paddingTop: 10}}>
            <Typography style={{...styles.mono, color: 'red', display: 'inline'}}>
              {this.props.error}&nbsp;
            </Typography>
          </Box>
        )}
        {!this.props.error && (
          <Box>
            <SignerView signer={this.props.sender} mode={this.props.mode} unsigned={unsigned} />
            <Divider />

            <Box style={{paddingLeft: 10, paddingTop: 10}}>
              <Typography style={{...styles.mono, display: 'inline'}}>{this.props.fileOut}&nbsp;</Typography>
              <Link inline onClick={this.openFolder}>
                Open Folder
              </Link>
            </Box>
          </Box>
        )}
      </Box>
    )
  }
}
