import * as React from 'react'

import {Box, Divider, FormControl, InputLabel, MenuItem, Select, Typography} from '@material-ui/core'

import UserLabel from '../user/label'

import {keys} from '../../rpc/keys'
import {KeysRequest, KeysResponse, Key, KeyType, SortDirection} from '../../rpc/keys.d'

export type Props = {
  value?: Key
  onChange: (value?: Key) => void
  disabled?: boolean
  placeholder?: string
  placeholderDisabled?: boolean
  itemLabel?: string
}

export default (props: Props) => {
  const [options, setOptions] = React.useState((props.value ? [props.value] : []) as Key[])

  const onChange = (event: React.ChangeEvent<{value: unknown}>) => {
    const value = event.target.value as string
    const selected = options.find((o) => {
      return o.id == value
    })
    props.onChange(selected)
  }

  const listKeys = () => {
    const req: KeysRequest = {
      query: '',
      types: [KeyType.EDX25519],
    }
    keys(req).then((resp: KeysResponse) => {
      setOptions(resp.keys || [])
    })
  }
  React.useEffect(() => {
    listKeys()
  }, [])

  return (
    <Box display="flex" flex={1} style={{marginRight: 8}}>
      <Select
        onChange={onChange}
        value={props.value?.id || ''}
        disableUnderline
        fullWidth
        disabled={props.disabled}
        displayEmpty
        SelectDisplayProps={{
          style: {
            paddingLeft: 8,
            paddingTop: 11,
            paddingBottom: 10,
            backgroundColor: 'white',
            // color: '#666',
          },
        }}
      >
        {props.placeholder && (
          <MenuItem key="sk-none" value="" disabled={props.placeholderDisabled}>
            <Typography style={{color: '#a2a2a2'}}>{props.placeholder}</Typography>
          </MenuItem>
        )}
        {options.map((k: Key) => (
          <MenuItem key={k.id} value={k.id}>
            <Box>
              {props.itemLabel && (
                <Typography display="inline" style={{color: '#a2a2a2'}}>
                  {props.itemLabel}&nbsp;
                </Typography>
              )}
              <UserLabel kid={k.id!} user={k.user} />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}
