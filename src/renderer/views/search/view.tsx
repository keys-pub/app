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

import {IDView} from '../key/content'

import KeyDialog from '../key'

import UserLabel from '../user/label'
import {styles} from '../../components'

import {Key, SearchRequest, SearchResponse} from '../../rpc/keys.d'
import {search} from '../../rpc/keys'

import {debounce, throttle} from 'lodash'

type Props = {
  select: (k: Key) => void
}

type State = {
  input: string
  loading: boolean
  query: string
  keys: Array<Key>
}

// TODO: UserLabel is KeyLabel

export default class SearchView extends React.Component<Props, State> {
  state = {
    input: '',
    loading: false,
    query: '',
    keys: [],
  }

  debounceSearch = debounce((q: string) => this.search(q), 100)

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.search(this.state.input)
  }

  search = (query: string) => {
    this.setState({loading: true})
    const req: SearchRequest = {query: query}
    search(req)
      .then((resp: SearchResponse) => {
        if (this.state.input === query) {
          const keys = resp.keys || []
          this.setState({
            loading: false,
            query: query,
            keys: keys,
          })
        }
      })
      .catch((err: Error) => {
        this.setState({loading: false})
      })
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
    const {loading} = this.state
    return (
      <Box display="flex" flex={1} flexDirection="column" style={{position: 'relative'}}>
        <Box
          paddingTop={1}
          paddingLeft={1}
          paddingRight={1}
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
          />
        </Box>
        <Box marginBottom={1} />
        {!loading && <Divider style={{marginTop: 3}} />}
        {loading && <LinearProgress />}
        <Box style={{overflowY: 'auto', height: '100%'}}>
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
                    <UserLabel kid={k.id!} user={k.user} />
                  </TableCell>
                  <TableCell style={{verticalAlign: 'top'}}>
                    <IDView id={k.id!} />
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
