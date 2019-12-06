// @flow
import React, {Component} from 'react'

import {
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Typography,
} from '@material-ui/core'

import {search} from '../../rpc/rpc'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import KeyDialog from '../key/dialog'
import {NamesView} from '../profile/user/views'
import {styles} from '../components'
import {keyEmpty} from '../state'

import type {Key, SearchResult, User} from '../../rpc/types'
import type {SearchRequest, SearchResponse, RPCError, RPCState} from '../../rpc/rpc'

type Props = {
  dispatch: (action: any) => any,
}

type State = {
  input: string,
  results: Array<SearchResult>,
  query: string,
  dialogOpen: boolean,
  key: Key,
}

class SearchView extends Component<Props, State> {
  state = {
    input: '',
    query: '',
    results: [],
    dialogOpen: false,
    key: keyEmpty(),
  }

  componentDidMount() {
    this.search('')
  }
  componentDidUpdate() {
    if (this.state.query != this.state.input) {
      this.search(this.state.input)
    }
  }

  search = (query: string) => {
    const req: SearchRequest = {query: query, index: 0, limit: 100}
    this.props.dispatch(
      search(req, (resp: SearchResponse) => {
        if (this.state.input === query) {
          this.setState({
            query: query,
            results: resp.results || [],
          })
        }
      })
    )
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      input: e.target.value,
    })
  }

  select = (result: SearchResult) => {
    // this.setState({dialogOpen: true, key: key})
    this.props.dispatch(push('/key?kid=' + result.kid))
  }

  render() {
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Box paddingLeft={1} paddingBottom={2} paddingRight={1}>
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
        <Divider />
        <Box display="flex" flexDirection="column">
          <Table size="small">
            <TableBody>
              {this.state.results.map((result: SearchResult, index: number): any => {
                return (
                  <TableRow hover onClick={event => this.select(result)} key={result.kid}>
                    <TableCell>
                      <Box display="flex" flexDirection="row">
                        <NamesView users={result.users || []} />
                        <Typography style={{...styles.mono, color: '#3f3f3f'}} noWrap>
                          {result.kid}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
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

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(SearchView)
