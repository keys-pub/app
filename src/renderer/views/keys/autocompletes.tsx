import * as React from 'react'

import {TextField, Typography} from '@material-ui/core'
import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete from '@material-ui/lab/Autocomplete'

import UserLabel from '../user/label'
import matchSorter from 'match-sorter'

import {keys} from '../../rpc/rpc'
import {RPCError, Key, KeysRequest, KeysResponse} from '../../rpc/types'
import {styles} from '../../components'

export type Props = {
  identities?: string[]
  disabled?: boolean
  onChange?: (value: string[]) => void
  placeholder?: string
}

type State = {
  open: boolean
  loading: boolean
  options: Key[]
  selected: Key[]
  defaultValues: string[]
  error: string
}

export default class AutocompletesView extends React.Component<Props, State> {
  state = {
    open: false,
    loading: false,
    options: [],
    selected: [],
    defaultValues: this.props.identities || [],
    error: '',
  }

  componentDidMount() {
    this.search('')
  }

  search = (q: string) => {
    this.setState({loading: true}) // , options: []
    const req: KeysRequest = {query: q}
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        this.setState({error: err.details, loading: false})
        return
      }

      // Set default selected keys.
      if (this.state.defaultValues.length > 0) {
        const selected = resp.keys.filter((k: Key) => {
          return this.state.defaultValues.includes(k.id) || this.state.defaultValues.includes(k.user?.id)
        })
        this.setState({defaultValues: [], selected: selected})
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
    const keys = value as Key[]
    this.setState({selected: keys})
    const identities = keys.map((k: Key) => {
      return k.user?.id || k.id
    })

    if (!!this.props.onChange) {
      this.props.onChange(identities)
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

  getOptionLabel = (option: Key): string => {
    return ((<UserLabel kid={option.id} user={option.user} />) as unknown) as string
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
        multiple
        filterOptions={filterOptions}
        onInputChange={this.onInputChange}
        onChange={this.onChange}
        value={this.state.selected}
        getOptionSelected={this.optionSelected}
        getOptionLabel={this.getOptionLabel}
        options={options}
        ChipProps={{variant: 'outlined', size: 'small'}} //  icon: <FaceIcon />,
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
              // endAdornment: (
              //   <React.Fragment>
              //     {loading ? <CircularProgress color="inherit" size={20} /> : null}
              //     {params.InputProps.endAdornment}
              //   </React.Fragment>
              // ),
            }}
          />
        )}
      />
    )
  }
}

const ChipLabel = (props: {children?: any}) => {
  return <Typography style={{...styles.mono}}>{props.children}</Typography>
}
