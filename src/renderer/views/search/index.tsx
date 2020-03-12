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

import KeyDialog from '../key'

import UserLabel from '../user/label'
import {styles} from '../../components'

import {RPCError, User, UserSearchRequest, UserSearchResponse} from '../../rpc/types'
import {userSearch} from '../../rpc/rpc'

type Props = {}

type State = {
  error: string
  input: string
  loading: boolean
  openKey: string
  query: string
  users: Array<User>
}

export default class SearchView extends React.Component<Props, State> {
  state = {
    error: '',
    input: '',
    loading: false,
    openKey: '',
    query: '',
    users: [],
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.search(this.state.input)
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
    this.setState({openKey: user.kid})
    // store.dispatch(push('/keys/key/index?kid=' + user.kid + '&update=1'))
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
                <TableRow
                  hover
                  onClick={event => this.select(user)}
                  key={user.kid + user.id}
                  style={{cursor: 'pointer'}}
                >
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
        <KeyDialog
          open={this.state.openKey != ''}
          close={() => this.setState({openKey: ''})}
          kid={this.state.openKey}
          update={true}
          source="search"
          refresh={this.refresh}
        />
      </Box>
    )
  }
}
