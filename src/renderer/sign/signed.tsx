import * as React from 'react'

import {Button, IconButton, Input, Typography, Box} from '@material-ui/core'

import {CopyIcon} from '../icons'

import {mono} from '../theme'
import {clipboard} from 'electron'
import {openSnack, openSnackError} from '../snack'

export type Props = {
  value: string
}

// TODO: This is a copy of encrypted.tsx

export default (props: Props) => {
  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    openSnack({message: 'Copied to Clipboard', duration: 2000})
  }
  const disabled = !props.value

  return (
    <Box style={{width: '100%', height: '100%', position: 'relative'}}>
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
          color: 'rgba(0, 0, 0, 0.87)',
          ...mono,
          outline: 0,
          resize: 'none',
          paddingTop: 8,
          paddingLeft: 8,
        }}
      />
      {props.value && (
        <Box
          style={{
            position: 'absolute',
            right: 16,
            top: 4,
          }}
        >
          <IconButton onClick={copyToClipboard} style={{padding: 4, backgroundColor: 'white'}}>
            <CopyIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}
