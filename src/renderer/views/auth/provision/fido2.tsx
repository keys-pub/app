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
import {Link} from '../../../components'
import Dialog from '../../../components/dialog'
import Snack, {SnackProps} from '../../../components/snack'

import {authProvision} from '../../../rpc/keys'
import {AuthType, Encoding} from '../../../rpc/keys.d'
import {devices as listDevices} from '../../../rpc/fido2'
import {Device} from '../../../rpc/fido2.d'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [pin, setPin] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

  const onInputChangePin = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    setPin(target.value || '')
  }, [])

  const onAuthProvision = async () => {
    if (!selectedDevice?.path) {
      openSnack({message: 'No device selected.', duration: 4000, alert: 'error'})
      return
    }

    setLoading(true)
    try {
      openSnack({message: 'Creating the credential, you may need to interact with the device', alert: 'info'})
      const gen = await authProvision({
        secret: pin,
        type: AuthType.FIDO2_HMAC_SECRET_AUTH,
        device: selectedDevice?.path,
        generate: true,
      })

      openSnack({
        message: 'Getting the credential, you may need to interact with the key (again)',
        alert: 'info',
      })

      const provision = await authProvision({
        secret: pin,
        type: AuthType.FIDO2_HMAC_SECRET_AUTH,
        device: selectedDevice?.path,
      })

      setLoading(false)
      setSnackOpen(false)
      props.close('FIDO2 key saved.')
    } catch (err) {
      setLoading(false)
      openSnack({message: err.message, duration: 6000, alert: 'error'})
    }
  }

  const [selectedDevice, setSelectedDevice] = React.useState<Device>()
  const [devices, setDevices] = React.useState<Device[]>([])

  const onFIDO2Devices = async () => {
    try {
      const resp = await listDevices({})
      setDevices(resp.devices || [])
    } catch (err) {
      openSnack({message: err.message, duration: 6000, alert: 'error'})
    }
  }

  React.useEffect(() => {
    onFIDO2Devices()
  }, [])

  const onDeviceChange = (event: React.ChangeEvent<{value: unknown}>) => {
    const value = event.target.value as string
    const selected = devices.find((d: Device) => {
      return d.path == value
    })
    setSelectedDevice(selected)
  }

  return (
    <Dialog
      open={props.open}
      title="FIDO2 Key"
      close={{label: 'Cancel', color: 'secondary', action: () => props.close()}}
      actions={[{label: 'Provision', color: 'primary', action: () => onAuthProvision()}]}
      disabled={loading}
    >
      <Box display="flex" flex={1} flexDirection="column" alignItems="center" style={{width: '100%'}}>
        <FormControl style={{width: 200}}>
          <Select
            variant="outlined"
            value={selectedDevice?.path || 'none'}
            onChange={onDeviceChange}
            style={{marginBottom: 20}}
          >
            <MenuItem value="none">Select a device</MenuItem>
            {devices?.map((d: Device) => (
              <MenuItem value={d.path}>
                {d.product} ({d.manufacturer})
              </MenuItem>
            ))}
          </Select>

          <TextField
            id="pinInput"
            autoFocus
            label="PIN"
            variant="outlined"
            type="password"
            onChange={onInputChangePin}
            value={pin}
            disabled={loading}
          />
        </FormControl>
      </Box>
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Dialog>
  )
}
