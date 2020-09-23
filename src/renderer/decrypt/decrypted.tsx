import * as React from 'react'

import {Button, Divider, IconButton, Input, Box, Typography} from '@material-ui/core'

import {CopyIcon} from '../icons'
import SignerView from '../verify/signer'
import {regular} from '../theme'
import {clipboard} from 'electron'
import {openSnack} from '../snack'

import {Key, EncryptMode} from '../rpc/keys.d'

export type Props = {
  value: string
  sender?: Key
  mode?: EncryptMode
  reloadSender: () => void
}

export default (props: Props) => {
  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    openSnack({message: 'Copied to Clipboard', duration: 2000})
  }

  const disabled = !props.value
  const unsigned = !disabled && !props.sender

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <SignerView signer={props.sender} mode={props.mode} unsigned={unsigned} reload={props.reloadSender} />
      <Divider />
      <Box display="flex" style={{position: 'relative'}}>
        <textarea
          readOnly
          value={props.value}
          spellCheck="false"
          style={{
            height: 'calc(100% - 8px)',
            width: 'calc(100% - 8px)',
            overflow: 'auto',
            border: 'none',
            padding: 0,
            ...regular,
            outline: 0,
            resize: 'none',
            paddingTop: 8,
            paddingLeft: 8,
          }}
        />
        {props.value && (
          <Box style={{position: 'absolute', right: 16, top: 4}}>
            <IconButton onClick={copyToClipboard} style={{padding: 4, backgroundColor: 'white'}}>
              <CopyIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  )
}
