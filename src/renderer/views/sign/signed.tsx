import * as React from 'react'

import {Button, IconButton, Input, Typography, Box} from '@material-ui/core'

import {Assignment as CopyIcon} from '@material-ui/icons'

import {styles} from '../../components'
import Snack, {SnackProps} from '../../components/snack'

import {clipboard} from 'electron'

export type Props = {
  value: string
}

// TODO: This is a copy of encrypted.tsx

export default (props: Props) => {
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    setSnack({message: 'Copied to Clipboard', duration: 2000})
    setSnackOpen(true)
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
          ...styles.mono,
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
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}
