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

import {RPCError, Key, SearchRequest, SearchResponse} from '../../rpc/keys.d'
import {search} from '../../rpc/keys'

type Props = {
  select: (k: Key) => void
  tableHeight: string
}

type State = {
  error: string
  input: string
  loading: boolean
  query: string
  keys: Array<Key>
}

// TODO: UserLabel is KeyLabel

export default class SearchView extends React.Component<Props, State> {
  state = {
    error: '',
    input: '',
    loading: false,
    query: '',
    keys: [],
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.search(this.state.input)
  }

  search = (query: string) => {
    this.setState({loading: true, error: ''})
    const req: SearchRequest = {query: query}
    search(req, (err: RPCError, resp: SearchResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (this.state.input === query) {
        const keys = resp.keys || []
        this.setState({
          loading: false,
          query: query,
          keys: keys,
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

  select = (k: Key) => {
    this.props.select(k)
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
        <Box style={{overflowY: 'auto', height: this.props.tableHeight}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography style={{...styles.mono}}>User</Typography>
                </TableCell>
                <TableCell>
                  <Typography style={{...styles.mono}}>Key</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.keys.map((k: Key, index: number): any => (
                <TableRow hover onClick={(event) => this.select(k)} key={k.id} style={{cursor: 'pointer'}}>
                  <TableCell component="th" scope="row">
                    <UserLabel kid={k.id} user={k.user} />
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDView id={k.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    )
  }
}
