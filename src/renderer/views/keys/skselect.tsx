import * as React from 'react'

import {Box, Divider, FormControl, InputLabel, MenuItem, Select} from '@material-ui/core'

import {store} from '../../store'

import UserRow from '../user/row'

import {keys, RPCError} from '../../rpc/rpc'
import {KeysRequest, KeysResponse, Key, KeyType} from '../../rpc/types'

export type Props = {
  defaultValue?: string
  onChange?: (value: string) => void
  includeAnon?: boolean
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
    selected: this.props.defaultValue || '',
    error: '',
  }

  componentDidMount() {
    this.listKeys()
  }

  listKeys = () => {
    this.setState({loading: true}) // , options: []
    const req: KeysRequest = {
      types: [KeyType.ED25519],
    }
    store.dispatch(
      keys(
        req,
        (resp: KeysResponse) => {
          this.setState({options: resp.keys || [], loading: false})
        },
        (err: RPCError) => {
          this.setState({error: err.details, loading: false})
        }
      )
    )
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
      <Box>
        <Select
          onChange={this.onChange}
          value={this.state.selected || ''}
          disableUnderline
          fullWidth
          displayEmpty
          inputProps={{style: {color: 'red'}}}
          SelectDisplayProps={{
            style: {
              paddingLeft: 8,
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: 'white',
              // color: '#666',
            },
          }}
        >
          {this.props.includeAnon && (
            <MenuItem key={'sk-none'} value={''}>
              No Signer
            </MenuItem>
          )}
          {this.state.options.map((k: Key) => (
            <MenuItem key={k.id} value={k.id}>
              <UserRow kid={k.id} user={k.user} />
            </MenuItem>
          ))}
        </Select>
      </Box>
    )
  }
}
