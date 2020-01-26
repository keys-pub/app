import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import {IDView, KeyDescriptionView} from '../key/view'

import {NamesView} from '../user/views'
import {styles} from '../../components'

import {UserSearchResult, UserSearchRequest, UserSearchResponse} from '../../rpc/types'
import {userSearch, RPCError, RPCState} from '../../rpc/rpc'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  input: string
  results: Array<UserSearchResult>
  loading: boolean
  query: string
  error: string
}

class SearchView extends React.Component<Props, State> {
  state = {
    input: '',
    results: [],
    loading: false,
    query: '',
    error: '',
  }

  componentDidMount() {
    this.search('')
  }

  search = (query: string) => {
    this.setState({loading: true, error: ''})
    const req: UserSearchRequest = {query: query, limit: 0}
    this.props.dispatch(
      userSearch(
        req,
        (resp: UserSearchResponse) => {
          if (this.state.input === query) {
            this.setState({
              loading: false,
              query: query,
              results: resp.results || [],
            })
          }
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.details})
        }
      )
    )
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      input: target.value,
    })
    this.search(target.value)
  }

  select = (result: UserSearchResult) => {
    // this.setState({dialogOpen: true, key: key})
    this.props.dispatch(push('/key/index?kid=' + result.kid))
  }

  render() {
    const {loading} = this.state
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Box paddingLeft={1} paddingBottom={1} paddingRight={1}>
          <TextField
            placeholder="Search"
            variant="outlined"
            value={this.state.input}
            onChange={this.onInputChange}
            inputProps={{style: {paddingTop: 8, paddingBottom: 8}}}
            fullWidth={true}
            style={{marginTop: 2}}
          />
        </Box>
        {this.state.error && (
          <Typography style={{color: 'red', marginLeft: 10}}>{this.state.error}</Typography>
        )}
        {!loading && <Divider style={{marginTop: 3}} />}
        {loading && <LinearProgress />}
        <Box display="flex" flexDirection="column">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography style={{...styles.mono}}>User</Typography>
                </TableCell>
                <TableCell>
                  <Typography style={{...styles.mono}}>ID</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.results.map((result: UserSearchResult, index: number): any => (
                <TableRow hover onClick={event => this.select(result)} key={result.kid}>
                  <TableCell component="th" scope="row">
                    <NamesView users={result.users || []} />
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDView id={result.kid} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        {/*<KeyDialog
          open={this.state.dialogOpen}
          close={() => this.setState({dialogOpen: false})}
          add={this.add}
          remove={this.remove}
          value={this.state.key}
        />*/}
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any) => {
  return {}
}

export default connect(mapStateToProps)(SearchView)
