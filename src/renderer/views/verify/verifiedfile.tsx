import * as React from 'react'

import {Button, Divider, Input, Box, Typography} from '@material-ui/core'

import {styles, Link} from '../../components'

import SignerView from '../verify/signer'

import {shell} from 'electron'
import {Key, EncryptMode} from '../../rpc/keys.d'

export type Props = {
  fileOut: string
  signer?: Key
  reloadKey: () => void
}

export default (props: Props) => {
  const openFolder = () => {
    shell.showItemInFolder(props.fileOut)
  }

  const unsigned = props.fileOut && !props.signer

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <Box>
        <SignerView signer={props.signer} unsigned={unsigned} reload={props.reloadKey} />
        <Divider />

        <Box style={{paddingLeft: 10, paddingTop: 10}}>
          <Typography style={{...styles.mono, display: 'inline'}}>{props.fileOut}&nbsp;</Typography>
          <Link inline onClick={openFolder}>
            Open Folder
          </Link>
        </Box>
      </Box>
    </Box>
  )
}
