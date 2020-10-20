import * as React from 'react'

import {
  Box,
  Button,
  CircularProgress,
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

import {IDLabel} from '../key/label'

import UserLabel from '../user/label'

import Snack, {SnackProps} from '../components/snack'

import {Key, SearchRequest, SearchResponse} from '@keys-pub/tsclient/lib/keys'
import {keys} from '../rpc/client'

import {debounce, throttle} from 'lodash'

type Props = {
  select: (k: Key) => void
}

type State = {
  input: string
  loading: boolean
  query: string
  keys: Array<Key>
  snackOpen: boolean
  snack?: SnackProps
}

export default class SearchView extends React.Component<Props, State> {
  state: State = {
    input: '',
    loading: false,
    query: '',
    keys: [],
    snackOpen: false,
  }

  debounceSearch = debounce((q: string) => this.search(q), 100)

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.search(this.state.input)
  }

  search = async (query: string) => {
    this.setState({loading: true})
    try {
      const resp = await keys.Search({query: query})
      if (this.state.input == query) {
        const keys = resp.keys || []
        this.setState({
          loading: false,
          query: query,
          keys: keys,
        })
      }
      this.setState({loading: false})
    } catch (err) {
      this.setState({
        loading: false,
        snackOpen: true,
        snack: {message: err.message, alert: 'error', duration: 4000},
      })
    }
  }

  onInputChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      input: target.value,
    })
    this.debounceSearch(target.value)
  }

  select = (k: Key) => {
    this.props.select(k)
  }

  render() {
    const {loading, snackOpen, snack} = this.state
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{position: 'relative'}}>
        <Box
          paddingTop={1}
          paddingLeft={1}
          paddingRight={1}
          paddingBottom={1}
          style={{position: 'sticky', top: 0, backgroundColor: 'white'}}
        >
          <TextField
            placeholder="Search keys.pub"
            variant="outlined"
            value={this.state.input}
            onChange={this.onInputChange}
            inputProps={{style: {paddingTop: 8, paddingBottom: 8}, spellCheck: 'false'}}
            fullWidth={true}
            style={{marginTop: 2}}
            InputProps={{
              endAdornment: loading ? <CircularProgress size={20} /> : null,
            }}
          />
        </Box>
        <Divider />
        <Box style={{overflowY: 'auto', height: '100%'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography>User</Typography>
                </TableCell>
                <TableCell style={{width: 500}}>
                  <Typography>Key</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.keys.map((k: Key, index: number): any => (
                <TableRow hover onClick={(event) => this.select(k)} key={k.id} style={{cursor: 'pointer'}}>
                  <TableCell component="th" scope="row">
                    {k.user && <UserLabel user={k.user} />}
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDLabel k={k} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Snack open={snackOpen} {...snack} onClose={() => this.setState({snackOpen: false})} />
      </Box>
    )
  }
}
