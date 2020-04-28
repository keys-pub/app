import * as React from 'react'

import {Box, Button, Snackbar, SnackbarContent, TextField, Typography} from '@material-ui/core'

import {clipboard} from 'electron'

type Props = {
  password: string
  visible: boolean
  setVisible: (b: boolean) => void
  generate?: () => void
}

export default (props: Props) => {
  const [openSnack, setSnackOpen] = React.useState(false)

  const copyPassword = () => {
    clipboard.writeText(props.password)
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
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        open={openSnack}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
      >
        <SnackbarContent
          aria-describedby="client-snackbar"
          message={<span id="client-snackbar">Copied to Clipboard</span>}
        />
      </Snackbar>
    </Box>
  )
}
