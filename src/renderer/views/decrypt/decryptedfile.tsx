import * as React from 'react'

import {Button, Divider, Input, Box, Typography} from '@material-ui/core'

import {Link} from '../../components'

import SignerView from '../verify/signer'

import {shell} from 'electron'
import {Key, EncryptMode} from '../../rpc/keys.d'

export type Props = {
  fileOut: string
  sender?: Key
  mode?: EncryptMode
  reloadKey: () => void
}

export default (props: Props) => {
  const openFolder = () => {
    shell.showItemInFolder(props.fileOut)
  }

  const unsigned = !!props.fileOut && !props.sender

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <Box>
        <SignerView signer={props.sender} mode={props.mode} unsigned={unsigned} reload={props.reloadKey} />
        <Divider />

        <Box style={{paddingLeft: 10, paddingTop: 10}}>
          <Typography variant="body2" style={{display: 'inline'}}>
            {props.fileOut}&nbsp;
          </Typography>
          <Link inline onClick={openFolder}>
            Open Folder
          </Link>
        </Box>
      </Box>
    </Box>
  )
}
