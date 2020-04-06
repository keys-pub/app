import * as React from 'react'

import {Box} from '@material-ui/core'

import KeyDialog from '../key'
import SearchView from './view'

import {RPCError, Key, User, UserSearchRequest, UserSearchResponse} from '../../rpc/types'

type Props = {}

type State = {
  openKey: string
}

export default class SearchIndexView extends React.Component<Props, State> {
  state = {
    openKey: '',
  }

  select = (k: Key) => {
    this.setState({openKey: k.id})
    // store.dispatch(push('/keys/key/index?kid=' + user.kid + '&update=1'))
  }

  refresh = () => {
    console.log('TODO')
  }

  render() {
    return (
      <Box>
        <SearchView select={this.select} tableHeight="calc(100vh - 80px)" />
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
