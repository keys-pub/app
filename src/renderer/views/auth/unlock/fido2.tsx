import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'

import Header from '../../header'
import Logo from '../../logo'
import {Link} from '../../../components'

import {authUnlock} from '../../../rpc/keys'
import {AuthType} from '../../../rpc/keys.d'
import SelectDevice from '../../authenticators/select'
import Snack, {SnackProps} from '../../../components/snack'
import {Device} from '../../../rpc/fido2.d'

import {store, unlocked} from '../../store'
import ActionsView, {Action} from './actions'

type Props = {
  actions?: Action[]
}

export default (props: Props) => {
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

  const inputRef = React.useRef<HTMLInputElement>()
  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setInput(target.value)
    setSnackOpen(false)
  }, [])

  const onUnlock = async () => {
    setLoading(true)
    setSnackOpen(false)

    try {
      openSnack({message: 'You may need to interact with the device', alert: 'info'})
      const resp = await authUnlock({
        secret: input,
        type: AuthType.FIDO2_HMAC_SECRET_AUTH,
        client: 'app',
      })
      setSnackOpen(false)
      await unlocked(resp.authToken)
    } catch (err) {
      openSnack({message: err.message, alert: 'error', duration: 6000})
      setLoading(false)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      onUnlock()
    }
  }

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" style={{height: '100%'}}>
      <Header noLock noBack />
      <Logo top={60} />
      <Typography style={{paddingTop: 10, paddingBottom: 20}}>Enter PIN (if required).</Typography>
      <FormControl style={{marginBottom: 10}}>
        <TextField
          id="pinInput"
          autoFocus
          label="PIN"
          variant="outlined"
          type="password"
          onChange={onInputChange}
          inputProps={{
            ref: inputRef,
            style: {fontSize: 32, height: 18},
            onKeyDown: onKeyDown,
          }}
          value={input}
          style={{fontSize: 48, width: 200}}
          disabled={loading}
        />
        <FormHelperText> </FormHelperText>
      </FormControl>
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
        <Button
          color="primary"
          variant="outlined"
          size="large"
          onClick={onUnlock}
          disabled={loading}
          id="unlockButton"
        >
          Unlock
        </Button>
      </Box>
      <ActionsView actions={props.actions} />
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}
