import * as React from 'react'

import {Button, Divider, Input, Box, IconButton, Typography} from '@material-ui/core'

import SignerView from '../verify/signer'
import Snack, {SnackProps} from '../../components/snack'

import {clipboard} from 'electron'

import {Key, EncryptMode} from '../../rpc/keys.d'

export type Props = {
  value: string
  sender?: Key
  mode?: EncryptMode
  reloadSender: () => void
}

export default (props: Props) => {
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    setSnack({message: 'Copied to Clipboard', duration: 2000})
    setSnackOpen(true)
  }

  const disabled = !props.value
  const unsigned = !disabled && !props.sender

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <SignerView signer={props.sender} mode={props.mode} unsigned={unsigned} reload={props.reloadSender} />
      <Divider />
      <Input
        multiline
        readOnly
        value={props.value}
        disableUnderline
        inputProps={{
          style: {
            height: '100%',
            overflow: 'auto',
            paddingTop: 8,
            paddingLeft: 8,
            paddingBottom: 0,
            paddingRight: 0,
          },
        }}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
      <Box style={{position: 'absolute', right: 20, bottom: 6}}>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disabled={disabled}
          onClick={copyToClipboard}
          style={{backgroundColor: 'white'}}
        >
          Copy to Clipboard
        </Button>
      </Box>
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}
