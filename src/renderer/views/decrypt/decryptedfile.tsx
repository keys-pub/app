import * as React from 'react'

import {Button, Divider, Input, Box, Snackbar, SnackbarContent, Typography} from '@material-ui/core'

import {styles, Link} from '../../components'

import SignerView from '../verify/signer'

import {shell} from 'electron'
import {dirname} from 'path'

import {Key, DecryptRequest, DecryptResponse} from '../../rpc/types'
import {CSSProperties} from '@material-ui/styles'

export type Props = {
  fileOut: string
  signer: Key
  error: string
}

type State = {}

export default class DecryptedFileView extends React.Component<Props, State> {
  openFolder = () => {
    shell.openItem(dirname(this.props.fileOut))
  }

  render() {
    let value = ''
    let stylesInput: CSSProperties = {}
    let unsigned
    const disabled = !this.props.fileOut
    if (this.props.error) {
      value = this.props.error
      stylesInput.color = 'red'
    } else {
      value = this.props.fileOut
      unsigned = !disabled && !this.props.signer
    }

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
        <SignerView signer={this.props.signer} unsigned={unsigned} />
        <Divider />
        <Box style={{paddingLeft: 10, paddingTop: 10}}>
          <Typography style={{...styles.mono, ...stylesInput, display: 'inline'}}>{value}&nbsp;</Typography>
          <Link inline onClick={this.openFolder}>
            Open Folder
          </Link>
        </Box>
      </Box>
    )
  }
}
