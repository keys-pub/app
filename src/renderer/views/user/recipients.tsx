import * as React from 'react'

import {TextField} from '@material-ui/core'

import Autocomplete from '@material-ui/lab/Autocomplete'

import {store} from '../../store'

import {userSearch, RPCError, RPCState} from '../../rpc/rpc'
import {UserSearchResult, UserSearchRequest, UserSearchResponse} from '../../rpc/types'

export type Props = {
  onChange?: (value: UserSearchResult[]) => void
}

type State = {
  open: boolean
  loading: boolean
  options: UserSearchResult[]
  selected: UserSearchResult[]
  error: string
}

export default class RecipientsView extends React.Component<Props, State> {
  state = {
    open: false,
    loading: false,
    options: [],
    selected: [],
    error: '',
  }

  componentDidMount() {
    this.search('')
  }

  search = (q: string) => {
    this.setState({loading: true}) // , options: []
    const req: UserSearchRequest = {query: q, limit: 100}
    store.dispatch(
      userSearch(
        req,
        (resp: UserSearchResponse) => {
          this.setState({options: resp.results || [], loading: false})
        },
        (err: RPCError) => {
          this.setState({error: err.details, loading: false})
        }
      )
    )
  }

  openAutoComplete = () => {
    this.search('')
    this.setState({open: true})
  }

  onInputChange = (event: React.ChangeEvent<{}>, value: string, reason: 'input' | 'reset') => {
    this.search(value)
  }

  onChange = (event: React.ChangeEvent<{}>, value: UserSearchResult[]) => {
    this.setState({selected: value})
    if (!!this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render() {
    const {open, loading, options} = this.state
    return (
      <Autocomplete
        open={open}
        multiple
        onOpen={this.openAutoComplete}
        onClose={() => {
          this.setState({open: false})
        }}
        onInputChange={this.onInputChange}
        onChange={this.onChange}
        value={this.state.selected}
        getOptionSelected={(option: UserSearchResult, value: UserSearchResult) => option.kid === value.kid}
        getOptionLabel={(option: UserSearchResult) => option.users[0].label}
        options={options}
        // loading={this.state.loading}
        // renderOption={option => (
        //   <React.Fragment>
        //     <span>{countryToFlag(option.code)}</span>
        //     {option.label} ({option.code}) +{option.phone}
        //   </React.Fragment>
        // )}
        renderInput={params => (
          <TextField
            {...params}
            placeholder="Recipients"
            fullWidth
            InputProps={{
              ...params.InputProps,
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
