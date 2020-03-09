import * as React from 'react'

import {Box, Button, IconButton, Menu, MenuItem, Typography} from '@material-ui/core'
import {Add, Settings} from '@material-ui/icons'

import {UserButton} from '../../components/user'

import {connect} from 'react-redux'

import {push} from 'connected-react-router'
// import {currentKey} from '../state'

import {User} from '../../rpc/types'
import {AppState} from '../../reducers/app'

type Props = {
  user: User
  dispatch: (action: any) => any
}

type State = {
  menuAnchor: any
}

class Header extends React.Component<Props, State> {
  state = {menuAnchor: null}

  // open = (event: any) => {
  //   this.setState({menuAnchor: event.currentTarget})
  // }

  // close = () => {
  //   this.setState({menuAnchor: null})
  // }

  showUser = () => {}

  compose = () => {
    this.props.dispatch(push('/compose'))
  }

  renderHeader() {
    return (
      <Box
        display="flex"
        flex={1}
        flexDirection="row"
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#282A30',
        }}
      >
        <Box style={{width: 20}} />

        <Box display="flex" flex={1} justifyContent="center" alignItems="center">
          <UserButton style={{maxWidth: 180, width: '100%'}} onClick={this.showUser} user={this.props.user} />
        </Box>

        {/* <Box style={{width: 20}} /> */}
        {this.props.user.name === '' && <Box style={{width: 20}} />}
        {this.props.user.name != '' && (
          <Box style={{marginRight: 0}}>
            <IconButton
              // aria-owns={this.state.menuAnchor ? 'add-menu' : null}
              // aria-haspopup="true"
              onClick={this.compose}
              style={{color: '#f2f2ff', paddingTop: 4, paddingLeft: 6, paddingRight: 8, paddingBottom: 4}}
            >
              <Add style={{fontSize: 28}} />
            </IconButton>
          </Box>
        )}
      </Box>
    )
  }

  render() {
    return (
      <Box>
        {/* #202226 */}
        <Box style={{height: 22, backgroundColor: '#181a20'}} />
        {this.renderHeader()}
        {/* <Menu
          id="add-menu"
          anchorEl={this.state.menuAnchor}
          open={Boolean(this.state.menuAnchor)}
          onClose={this.close}
        >
          <MenuItem onClick={this.create}>Create</MenuItem>
        </Menu> */}
      </Box>
    )
  }
}

const mapStateToProps = (state: {app: AppState}) => {
  // TODO
  return {
    user: {kid: '', name: '', service: '', seq: 0, url: '', err: '', verifiedAt: 0},
  }
}

export default connect(mapStateToProps)(Header)
