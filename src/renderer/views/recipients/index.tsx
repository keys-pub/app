import * as React from 'react'

import {Box, Paper, TextField, Typography} from '@material-ui/core'

import Autocomplete from '@material-ui/lab/Autocomplete'

import {connect} from 'react-redux'

import {search, SearchRequest, SearchResponse, RPCError, RPCState} from '../../rpc/rpc'
import {SearchResult} from '../../rpc/types'

export type Props = {
  dispatch: (action: any) => any
}

type State = {
  open: boolean
  loading: boolean
  options: Array<SearchResult>
  error: string
}

class RecipientsView extends React.Component<Props, State> {
  state = {
    open: false,
    loading: false,
    options: [],
    error: '',
  }

  search = (q: string) => {
    this.setState({loading: true, options: []})
    const req: SearchRequest = {query: q, limit: 100}
    this.props.dispatch(
      search(
        req,
        (resp: SearchResponse) => {
          this.setState({options: resp.results || [], loading: false})
        },
        (err: RPCError) => {
          this.setState({error: err.message, loading: false})
        }
      )
    )
  }

  onInputChange = (event: React.ChangeEvent<{}>, value: any, reason: 'input' | 'reset') => {
    this.search(value)
  }

  render() {
    const {open, loading, options} = this.state
    return (
      <Autocomplete
        style={{width: 300}}
        open={open}
        onOpen={() => {
          this.setState({open: true})
        }}
        onClose={() => {
          this.setState({open: false})
        }}
        onInputChange={this.onInputChange}
        getOptionSelected={(option: SearchResult, value: SearchResult) => option.kid === value.kid}
        getOptionLabel={(option: SearchResult) => option.kid}
        options={options}
        loading={this.state.loading}
        renderInput={params => (
          <TextField
            {...params}
            label="Asynchronous"
            fullWidth
            variant="outlined"
            InputProps={{
              ...params.InputProps,
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

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  return {}
}

export default connect(mapStateToProps)(RecipientsView)
