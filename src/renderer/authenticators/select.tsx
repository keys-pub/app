import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core'
import {RefreshIcon} from '../icons'

import {Link} from '../components'
import Dialog from '../components/dialog'

import {keys, fido2} from '../rpc/client'
import {AuthType, Encoding} from '@keys-pub/tsclient/lib/keys.d'
import {Device} from '@keys-pub/tsclient/lib/fido2.d'
import {openSnackError} from '../snack'

type Props = {
  onChange: (device?: Device) => void
}

export default (props: Props) => {
  const [selectedDevice, setSelectedDevice] = React.useState<Device>()
  const [devices, setDevices] = React.useState<Device[]>([])

  const onFIDO2Devices = async () => {
    try {
      const resp = await fido2.Devices({})
      const devices = resp.devices || []
      setDevices(devices)
      if (devices.length == 0) {
      } else if (devices.length == 1) {
        setSelectedDevice(devices[0])
      }
    } catch (err) {
      openSnackError(err)
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
    props.onChange(selected)
  }

  return (
    <Box display="flex" flexDirection="row" flex={1} alignItems="center">
      <Select
        variant="outlined"
        value={selectedDevice?.path || 'none'}
        onChange={onDeviceChange}
        style={{width: 200}}
      >
        <MenuItem value="none">Select a device</MenuItem>
        {devices?.map((d: Device) => (
          <MenuItem value={d.path} key={d.path}>
            {d.product} ({d.manufacturer})
          </MenuItem>
        ))}
      </Select>
      <Box>
        <IconButton onClick={onFIDO2Devices}>
          <RefreshIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
