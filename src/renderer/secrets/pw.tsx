import * as React from 'react'

import {Box, Button, TextField, Typography} from '@material-ui/core'

import {clipboard} from 'electron'
import Snack, {SnackProps} from '../components/snack'

type Props = {
  password: string
  visible: boolean
  setVisible: (b: boolean) => void
  generate?: () => void
}

export default (props: Props) => {
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const copyPassword = () => {
    clipboard.writeText(props.password)
    setSnack({message: 'Copied to Clipboard', duration: 2000})
    setSnackOpen(true)
  }

  const buttonStyle = {
    fontSize: '0.7em',
    height: 28,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  }

  return (
    <Box display="flex" flexDirection="row" style={{height: 34}}>
      {/* <IconButton onClick={() => this.setState({passwordVisible: !this.state.passwordVisible})}>
      <PasswordVisibleIcon />
    </IconButton> */}
      <Button
        size="small"
        variant="outlined"
        style={buttonStyle}
        onClick={() => props.setVisible(!props.visible)}
      >
        {props.visible ? 'Hide' : 'Show'}
      </Button>
      <Button size="small" variant="outlined" style={{...buttonStyle, marginLeft: 10}} onClick={copyPassword}>
        Copy
      </Button>
      {props.generate && (
        <Button
          size="small"
          variant="outlined"
          style={{...buttonStyle, marginLeft: 10}}
          onClick={props.generate}
        >
          Gen
        </Button>
      )}
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}
