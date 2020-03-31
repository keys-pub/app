import * as React from 'react'

import {TextField, Typography} from '@material-ui/core'
import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete'

import UserLabel from '../user/label'
import matchSorter from 'match-sorter'
import {CSSProperties} from '@material-ui/styles'

import {keys} from '../../rpc/rpc'
import {RPCError, Key, KeyType, KeysRequest, KeysResponse} from '../../rpc/types'
import styles, {serviceColor} from '../../components/styles'

export type Props = {
  identity?: string
  disabled?: boolean
  onChange?: (value: string) => void
  placeholder?: string
  keyTypes?: KeyType[]
  style?: CSSProperties
}

type State = {
  open: boolean
  loading: boolean
  options: Key[]
  selected: Key
  defaultValue: string
  error: string
}

export default class AutocompleteView extends React.Component<Props, State> {
  state = {
    open: false,
    loading: false,
    options: [],
    selected: null,
    defaultValue: this.props.identity,
    error: '',
  }

  componentDidMount() {
    this.search('')
  }

  search = (q: string) => {
    this.setState({loading: true}) // , options: []
    const req: KeysRequest = {query: q, types: this.props.keyTypes}
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        this.setState({error: err.details, loading: false})
        return
      }

      // Set default selected key.
      if (this.state.defaultValue) {
        const selected = resp.keys.find((k: Key) => {
          return this.state.defaultValue == k.id || this.state.defaultValue == k.user?.id
        })
        this.setState({defaultValue: null, selected: selected})
      }

      this.setState({options: resp.keys || [], loading: false})
    })
  }

  openAutoComplete = () => {
    this.search('')
    this.setState({open: true})
  }

  onInputChange = (event: React.ChangeEvent<{}>, value: string, reason: 'input' | 'reset') => {
    this.search(value)
  }

  onChange = (event: React.ChangeEvent<{}>, value: any) => {
    const key = value as Key
    this.setState({selected: key})
    const identity = key?.user?.id || key?.id
    if (!!this.props.onChange) {
      this.props.onChange(identity)
    }
  }

  renderOption = (option: Key) => {
    return (
      <React.Fragment>
        <UserLabel kid={option.id} user={option.user} />
      </React.Fragment>
    )
  }

  optionSelected = (option: Key, value: string) => {
    return option.id === value && option.user?.id === value
  }

  optionLabel = (option: Key): string => {
    return option.user?.id || option.id
  }

  render() {
    const filterOptions = (options, {inputValue}) =>
      matchSorter(options, inputValue, {keys: ['user.id', 'id']})

    const {open, loading, options} = this.state
    return (
      <Autocomplete
        open={open}
        disabled={this.props.disabled}
        onOpen={this.openAutoComplete}
        onClose={() => {
          this.setState({open: false})
        }}
        style={this.props.style}
        filterOptions={filterOptions}
        onInputChange={this.onInputChange}
        onChange={this.onChange}
        value={this.state.selected}
        getOptionSelected={this.optionSelected}
        getOptionLabel={this.optionLabel}
        options={options}
        renderOption={this.renderOption}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={this.props.placeholder}
            fullWidth
            InputProps={{
              ...params.InputProps,
              style: {...styles.mono},
              disableUnderline: true,
              inputComponent: InputCustom as any,
            }}
          />
        )}
      />
    )
  }
}
interface InputCustomProps {
  inputRef: (ref: HTMLInputElement | null) => void
}

const InputCustom = (props: InputCustomProps) => {
  const {inputRef, ...other} = props
  const inprops = other as any

  const [focused, setFocused] = React.useState(false)
  const focus = inprops.onFocus
  inprops.onFocus = event => {
    focus(event)
    setFocused(true)
  }
  const blur = inprops.onBlur
  inprops.onBlur = event => {
    blur(event)
    setFocused(false)
  }

  const spl = inprops.value.split('@', 2)
  const name = spl[0]
  const service = spl.length > 1 ? spl[1] : ''

  let scolor = serviceColor(service)

  return (
    <div style={{position: 'relative', width: '100%'}}>
      <span style={{position: 'absolute', left: 4, top: 5, opacity: focused ? 0.01 : 1.0}}>
        {name}
        {name && <span style={{color: scolor}}>@{service}</span>}
      </span>
      <input ref={inputRef} {...inprops} style={{width: '100%', opacity: focused ? 1.0 : 0.01}} />
    </div>
  )
}
