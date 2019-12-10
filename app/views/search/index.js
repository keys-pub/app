// @flow
import React, {Component} from 'react'

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

import {search} from '../../rpc/rpc'

import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import KeyDialog from '../key/dialog'
import {KeyTypeView} from '../key/view'

import {NamesView} from '../profile/user/views'
import {styles} from '../components'
import {keyEmpty} from '../state'

import type {Key, User} from '../../rpc/types'
import type {SearchRequest, SearchResponse, RPCError, RPCState} from '../../rpc/rpc'

type Props = {
  dispatch: (action: any) => any,
}

type State = {
  error?: string,
  input: string,
  key: Key,
  keys: Array<Key>,
  loading: boolean,
  query: string,
}

class SearchView extends Component<Props, State> {
  state = {
    input: '',
    key: keyEmpty(),
    keys: [],
    loading: false,
    query: '',
  }

  componentDidMount() {
    this.search('')
  }

  search = (query: string) => {
    this.setState({loading: true, error: ''})
    const req: SearchRequest = {query: query, index: 0, limit: 0}
    this.props.dispatch(
      search(
        req,
        (resp: SearchResponse) => {
          if (this.state.input === query) {
            this.setState({
              loading: false,
              query: query,
              keys: resp.keys || [],
            })
          }
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.message})
        }
      )
    )
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      input: e.target.value,
    })
    this.search(e.target.value)
  }

  select = (key: Key) => {
    // this.setState({dialogOpen: true, key: key})
    this.props.dispatch(push('/key?kid=' + key.kid))
  }

  render() {
    const {loading} = this.state
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
        {!loading && <Divider style={{marginBottom: 3}} />}
        {loading && <LinearProgress />}
        <Box display="flex" flexDirection="column">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography style={{...styles.mono}}>Type</Typography>
                </TableCell>

                <TableCell>
                  <Typography style={{...styles.mono}}>User</Typography>
                </TableCell>
                <TableCell>
                  <Typography style={{...styles.mono}}>Key ID</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.keys.map((key: Key, index: number): any => (
                <TableRow hover onClick={event => this.select(key)} key={key.kid}>
                  <TableCell component="th" scope="row" style={{width: 1}}>
                    <KeyTypeView type={key.type || 'NO_KEY_TYPE'} description={false} />
                  </TableCell>
                  <TableCell>
                    <NamesView users={key.users || []} />
                  </TableCell>
                  <TableCell>
                    <Typography style={{...styles.mono}} noWrap>
                      {key.kid}
                    </Typography>
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

export default connect<Props, {}, _, _, _, _>(mapStateToProps)(SearchView)
