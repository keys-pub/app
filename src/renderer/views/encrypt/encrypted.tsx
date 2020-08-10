import * as React from 'react'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {styles, Snack, SnackOpts} from '../../components'

import {clipboard} from 'electron'

export type Props = {
  value: string
}

export default (props: Props) => {
  const [snack, setSnack] = React.useState({message: ''} as SnackOpts)

  const copyToClipboard = () => {
    clipboard.writeText(props.value)
    setSnack({message: 'Copied to Clipboard', duration: 2000} as SnackOpts)
  }
  const disabled = !props.value

  return (
    <Box style={{width: '100%', height: '100%', position: 'relative'}}>
      <Input
        multiline
        readOnly
        value={props.value}
        disableUnderline
        inputProps={{
          style: {
            ...styles.mono,
            height: '100%',
            overflow: 'auto',
            paddingTop: 0,
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
