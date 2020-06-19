import * as React from 'react'

import {Button, Divider, Input, Box, Snackbar, SnackbarContent, Typography} from '@material-ui/core'

import {styles, Link} from '../../components'

import {shell} from 'electron'
import {dirname} from 'path'

import {Key, DecryptRequest, DecryptResponse} from '../../rpc/keys.d'
import {CSSProperties} from '@material-ui/styles'

export type Props = {
  fileOut: string
  error: string
}

type State = {}

export default class EncryptedFileView extends React.Component<Props, State> {
  openFolder = () => {
    shell.showItemInFolder(this.props.fileOut)
  }
  render() {
    let value = ''
    let stylesInput: CSSProperties = {}
    const disabled = !this.props.fileOut
    if (this.props.error) {
      value = this.props.error
      stylesInput.color = 'red'
    } else {
      value = this.props.fileOut
    }

    return (
      <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
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
