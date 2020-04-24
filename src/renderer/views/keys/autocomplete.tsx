import * as React from 'react'

import {Box, Divider, TextField, Typography} from '@material-ui/core'
import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete'

import UserLabel from '../user/label'
import matchSorter from 'match-sorter'
import {CSSProperties} from '@material-ui/styles'

import {store} from '../../store'
import {keys} from '../../rpc/keys'
import {RPCError, Key, KeyType, KeysRequest, KeysResponse} from '../../rpc/keys.d'
import styles, {serviceColor} from '../../components/styles'

import SearchDialog from '../search/dialog'
import KeyImportDialog from '../import'

export type Props = {
  identity?: string
  disabled?: boolean
  onChange?: (value: string) => void
  placeholder?: string
  keyTypes?: KeyType[]
  style?: CSSProperties
  addOptions?: boolean
}

type State = {
  defaultValue: string
  loading: boolean
  open: boolean
  openImport: boolean
  openSearch: boolean
  options: Key[]
  selected: Key
}

export default class AutocompleteView extends React.Component<Props, State> {
  state = {
    defaultValue: this.props.identity,
    loading: false,
    open: false,
    openImport: false,
    openSearch: false,
    options: [],
    selected: null,
  }

  componentDidMount() {
    this.search('')
  }

  search = (q: string) => {
    this.setState({loading: true}) // , options: []
    const req: KeysRequest = {query: q, types: this.props.keyTypes}
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        this.setState({loading: false, options: []})
        store.dispatch({type: 'ERROR', payload: {error: err}})
        return
      }

      // Set default selected key.
      if (this.state.defaultValue) {
        const selected = resp.keys.find((k: Key) => {
          return this.state.defaultValue == k.id || this.state.defaultValue == k.user?.id
        })
        this.setState({defaultValue: null, selected: selected})
      }

      const keys = this.createOptions(resp.keys)

      this.setState({options: keys, loading: false})
    })
  }

  createOptions = (options: Key[]): Key[] => {
    if (this.props.addOptions) {
      options = options.filter((k: Key) => k.id != 'search')
      options.push({id: 'search'})
      options = options.filter((k: Key) => k.id != 'import')
      options.push({id: 'import'})
    }
    return options
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
    if (key?.id == 'search') {
      this.openSearch()
      return
    }
    if (key?.id == 'import') {
      this.openImport()
      return
    }

    this.setState({selected: key})
    const identity = key?.user?.id || key?.id
    if (!!this.props.onChange) {
      this.props.onChange(identity)
    }
  }

  openSearch = () => {
    this.setState({openSearch: true})
  }

  closeSearch = () => {
    this.setState({openSearch: false})
  }

  openImport = () => {
    this.setState({openImport: true})
  }

  closeImport = () => {
    this.setState({openImport: false})
  }

  renderOption = (option: Key) => {
    if (option.id == 'search') {
      return <Typography style={{...styles.mono}}>Search for key...</Typography>
    }
    if (option.id == 'import') {
      return <Typography style={{...styles.mono}}>Import key...</Typography>
    }

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
    if (option.id == 'search' || option.id == 'import') {
      return ''
    }
    return option.user?.id || option.id
  }

  render() {
    const filterOptions = (options, {inputValue}) => {
      const filter = matchSorter(options, inputValue, {keys: ['user.id', 'id']})
      return this.createOptions(filter)
    }

    const {open, loading, options} = this.state
    return (
      <Box display="flex" flex={1}>
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
          renderInput={(params) => (
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
        <SearchDialog open={this.state.openSearch} close={this.closeSearch} />
        <KeyImportDialog open={this.state.openImport} close={this.closeImport} />
      </Box>
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
  inprops.onFocus = (event) => {
    focus(event)
    setFocused(true)
  }
  const blur = inprops.onBlur
  inprops.onBlur = (event) => {
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
        {name && service && <span style={{color: scolor}}>@{service}</span>}
      </span>
      <input ref={inputRef} {...inprops} style={{width: '100%', opacity: focused ? 1.0 : 0.01}} />
    </div>
  )
}
