import * as React from 'react'

import {Box, TextField, CircularProgress} from '@material-ui/core'

import Autocomplete from '@material-ui/lab/Autocomplete'
import {connect} from 'react-redux'

import {styles} from '../components'

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
    this.setState({options: []})
    const req: SearchRequest = {query: q, limit: 100}
    this.props.dispatch(
      search(
        req,
        (resp: SearchResponse) => {
          this.setState({options: resp.results, loading: false})
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
    const {open, options, loading} = this.state

    return (
      <Box style={{marginLeft: 100, marginRight: 100}}>
        <Autocomplete
          open={open}
          onInputChange={this.onInputChange}
          onOpen={() => {
            this.setState({open: true})
          }}
          onClose={() => {
            this.setState({open: false})
          }}
          getOptionSelected={(option, value) => option.kid === value.kid}
          getOptionLabel={option => option.kid}
          options={options}
          multiple
          debug
          renderInput={params => (
            <TextField
              {...params}
              label="Recipients"
              fullWidth
              // InputProps={{
              //   ...params.InputProps,
              //   endAdornment: (
              //     <React.Fragment>
              //       {loading ? <CircularProgress color="inherit" size={20} /> : null}
              //       {params.InputProps.endAdornment}
              //     </React.Fragment>
              //   ),
              // }}
            />
          )}
        />
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  return {}
}

export default connect(mapStateToProps)(RecipientsView)
