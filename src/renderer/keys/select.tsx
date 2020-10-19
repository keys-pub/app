import * as React from 'react'

import {Box, Divider, FormControl, InputLabel, MenuItem, Select, Typography} from '@material-ui/core'

import {KeyLabel} from '../key/label'

import {keys} from '../rpc/client'
import {KeysRequest, KeysResponse, Key, KeyType, SortDirection} from '@keys-pub/tsclient/lib/keys.d'

export type Props = {
  value?: Key
  onChange: (value?: Key) => void
  disabled?: boolean
  placeholder?: string
  placeholderDisabled?: boolean
  label?: string
  SelectDisplayProps?: React.HTMLAttributes<HTMLDivElement>
}

const empty = (_: {}) => {
  return null
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

  const listKeys = async () => {
    const req: KeysRequest = {
      query: '',
      types: [KeyType.EDX25519],
    }
    const resp = await keys.Keys(req)
    setOptions(resp.keys || [])
    // TODO: Catch error
  }

  React.useEffect(() => {
    listKeys()
  }, [])

  return (
    <Box display="flex" flex={1} style={{overflow: 'hidden'}}>
      <Select
        onChange={onChange}
        value={props.value?.id || ''}
        disableUnderline
        fullWidth
        disabled={props.disabled}
        displayEmpty
        IconComponent={empty}
        SelectDisplayProps={{
          style: {},
          ...(props.SelectDisplayProps || {}),
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
              {props.label && (
                <Typography display="inline" style={{color: '#a2a2a2'}}>
                  {props.label}&nbsp;
                </Typography>
              )}
              <KeyLabel k={k} />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}
