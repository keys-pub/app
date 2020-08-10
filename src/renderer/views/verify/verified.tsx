import * as React from 'react'

import {Button, Divider, Input, Box, IconButton, Typography} from '@material-ui/core'

import SignerView from '../verify/signer'
import {Snack, SnackOpts} from '../../components'

import {clipboard} from 'electron'

import {Key} from '../../rpc/keys.d'

export type Props = {
  value: string
  signer?: Key
  reloadSigner: () => void
}

// TODO: Mostly copied from decrypted.tsx

export default (props: Props) => {
  const [snack, setSnack] = React.useState({message: ''} as SnackOpts)

  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    setSnack({message: 'Copied to Clipboard', duration: 2000} as SnackOpts)
  }

  const disabled = !props.value
  const unsigned = !disabled && !props.signer

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <SignerView signer={props.signer} unsigned={unsigned} reload={props.reloadSigner} />
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
      <Snack
        open={!!snack.message}
        message={snack.message}
        duration={snack.duration}
        alert={snack.alert}
        onClose={() => setSnack({message: ''})}
      />
    </Box>
  )
}
