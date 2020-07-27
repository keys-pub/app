import * as React from 'react'

import {Box, Divider, FormControl, InputLabel, MenuItem, Select, Typography} from '@material-ui/core'

import {store} from '../../store'

import UserLabel from '../user/label'
import {styles} from '../../components'

import {keys} from '../../rpc/keys'
import {RPCError, KeysRequest, KeysResponse, Key, KeyType} from '../../rpc/keys.d'

export type Props = {
  defaultValue?: string
  disabled?: boolean
  onChange?: (value: string) => void
  placeholder?: string
  placeholderDisabled?: boolean
  itemLabel?: string
}

type State = {
  open: boolean
  loading: boolean
  options: Key[]
  selected: string
  error: string
}

export default class SignKeySelectView extends React.Component<Props, State> {
  state = {
    open: false,
    loading: false,
    options: [],
    selected: '',
    error: '',
  }

  componentDidMount() {
    this.listKeys()
  }

  listKeys = () => {
    this.setState({loading: true}) // , options: []
    const req: KeysRequest = {
      types: [KeyType.EDX25519],
    }
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        this.setState({error: err.details, loading: false})
        return
      }
      // TODO: Check default value exists
      this.setState({options: resp.keys || [], selected: this.props.defaultValue || '', loading: false})
    })
  }

  onChange = (event: React.ChangeEvent<{value: unknown}>) => {
    const value = event.target.value as string
    this.setState({selected: value})
    if (!!this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render() {
    return (
      <Box style={{overflow: 'hidden', marginRight: 8, paddingBottom: 4}}>
        <Select
          onChange={this.onChange}
          value={this.state.selected || ''}
          disableUnderline
          fullWidth
          disabled={this.props.disabled}
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
          {this.props.placeholder && (
            <MenuItem key="sk-none" value="" disabled={this.props.placeholderDisabled}>
              <Typography style={{color: '#a2a2a2'}}>{this.props.placeholder}</Typography>
            </MenuItem>
          )}
          {this.state.options.map((k: Key) => (
            <MenuItem key={k.id} value={k.id}>
              <Box>
                {this.props.itemLabel && (
                  <Typography display="inline" style={{color: '#a2a2a2'}}>
                    {this.props.itemLabel}&nbsp;
                  </Typography>
                )}
                <UserLabel kid={k.id} user={k.user} />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>
    )
  }
}
