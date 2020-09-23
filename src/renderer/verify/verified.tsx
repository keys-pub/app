import * as React from 'react'

import {Button, Divider, Input, Box, IconButton, Typography} from '@material-ui/core'

import {CopyIcon} from '../icons'
import SignerView from '../verify/signer'
import {regular} from '../theme'

import {clipboard} from 'electron'
import {openSnack} from '../snack'

import {Key} from '../rpc/keys.d'

export type Props = {
  value: string
  signer?: Key
  reloadSigner: () => void
}

// TODO: Mostly copied from decrypted.tsx

export default (props: Props) => {
  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    openSnack({message: 'Copied to Clipboard', duration: 2000})
  }

  const disabled = !props.value
  const unsigned = !disabled && !props.signer

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <SignerView signer={props.signer} unsigned={unsigned} reload={props.reloadSigner} />
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
