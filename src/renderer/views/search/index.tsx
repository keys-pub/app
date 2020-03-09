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

import {push} from 'connected-react-router'

import {IDView} from '../key/content'
import {store} from '../../store'

import UserLabel from '../user/label'
import {styles} from '../../components'

import {RPCError, User, UserSearchRequest, UserSearchResponse} from '../../rpc/types'
import {userSearch} from '../../rpc/rpc'

type Props = {}

type State = {
  input: string
  users: Array<User>
  loading: boolean
  query: string
  error: string
}

export default class SearchView extends React.Component<Props, State> {
  state = {
    input: '',
    users: [],
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
    userSearch(req, (err: RPCError, resp: UserSearchResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (this.state.input === query) {
        this.setState({
          loading: false,
          query: query,
          users: resp.users || [],
        })
      }
    })
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      input: target.value,
    })
    this.search(target.value)
  }

  select = (user: User) => {
    // this.setState({dialogOpen: true, key: key})
    store.dispatch(push('/keys/key/index?kid=' + user.kid + '&update=1'))
  }

  render() {
    const {loading} = this.state
    return (
      <Box display="flex" flex={1} flexDirection="column">
        <Box paddingLeft={1} paddingBottom={1} paddingRight={1}>
          <TextField
            placeholder="Search keys.pub"
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
              {this.state.users.map((user: User, index: number): any => (
                <TableRow hover onClick={event => this.select(user)} key={user.kid + user.id}>
                  <TableCell component="th" scope="row">
                    <UserLabel kid={user.kid} user={user} />
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDView id={user.kid} />
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
