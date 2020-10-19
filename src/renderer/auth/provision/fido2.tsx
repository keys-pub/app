import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core'
import {Link} from '../../components'
import Dialog from '../../components/dialog'

import SelectDevice from '../../authenticators/select'
import {openSnack, openSnackError, closeSnack} from '../../snack'

import {AuthType, Encoding} from '@keys-pub/tsclient/lib/keys.d'
import {Device} from '@keys-pub/tsclient/lib/fido2.d'
import {keys, fido2} from '../../rpc/client'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [pin, setPin] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onInputChangePin = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPin(target.value || '')
  }, [])

  const onAuthProvision = async () => {
    if (!selectedDevice?.path) {
      openSnackError(new Error('No device selected'))
      return
    }

    console.log('Using device:', selectedDevice)

    setLoading(true)
    try {
      openSnack({message: 'Creating the credential, you may need to interact with the device', alert: 'info'})
      const gen = await keys.AuthProvision({
        secret: pin,
        type: AuthType.FIDO2_HMAC_SECRET_AUTH,
        device: selectedDevice?.path,
        generate: true,
      })

      openSnack({
        message: 'Getting the credential, you may need to interact with the key (again)',
        alert: 'info',
      })

      const provision = await keys.AuthProvision({
        secret: pin,
        type: AuthType.FIDO2_HMAC_SECRET_AUTH,
        device: selectedDevice?.path,
      })

      setLoading(false)
      setPin('')
      closeSnack()
      props.close('FIDO2 key saved')
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  const [selectedDevice, setSelectedDevice] = React.useState<Device>()

  return (
    <Dialog
      open={props.open}
      title="FIDO2 Key"
      close={{label: 'Close', action: () => props.close()}}
      actions={[{label: 'Provision', color: 'primary', action: () => onAuthProvision()}]}
      disabled={loading}
    >
      <Box display="flex" flex={1} flexDirection="column" alignItems="center">
        <Box style={{marginLeft: 44.5}}>
          <SelectDevice onChange={setSelectedDevice} />
        </Box>
        <Box marginBottom={2} />
        <TextField
          id="pinInput"
          autoFocus
          label="PIN"
          variant="outlined"
          type="password"
          onChange={onInputChangePin}
          value={pin}
          disabled={loading}
          style={{width: 200}}
        />
      </Box>
    </Dialog>
  )
}
