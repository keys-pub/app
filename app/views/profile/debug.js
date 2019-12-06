// @flow
import React, {Component} from 'react'

import {Box, Button, Divider, Typography} from '@material-ui/core'

import {connect} from 'react-redux'
import {shell} from 'electron'

import {push, goBack} from 'connected-react-router'

import {routes} from '../routes'

import {styles, Link} from '../components'

import type {RPCState} from '../../rpc/rpc'

import type {RouteInfo} from '../routes'

type Props = {
  dispatch: (action: any) => any,
}

const cstyles = {
  label: {
    paddingRight: 7,
    marginRight: 7,
    minWidth: 120,
    fontWeight: 600,
    textAlign: 'right',
  },
  section: {
    paddingBottom: 20,
  },
}

class Debug extends Component<Props> {
  push = (route: string) => {
    const r = route
    return () => {
      this.props.dispatch(push(r))
    }
  }

  resetPrompts = () => {
    this.props.dispatch({type: 'PROMPT_PUBLISH', payload: true})
    this.props.dispatch({type: 'PROMPT_USER', payload: true})
  }

  error = () => {
    throw new Error('error!')
  }

  renderDebugActions() {
    return (
      <Box display="flex" flexDirection="row" style={cstyles.section}>
        <Typography style={cstyles.label}>Debug</Typography>
        <Box>
          <Link onClick={() => this.props.dispatch(push('/db'))} paragraph>
            Show DB
          </Link>
          <Link onClick={this.resetPrompts}>Reset Prompts</Link>
          <Link onClick={this.error}>Error</Link>
        </Box>
      </Box>
    )
  }

  renderRoutes() {
    return (
      <Box display="flex" flexDirection="row" style={cstyles.section}>
        <Typography style={cstyles.label}>Routes</Typography>
        <Box>
          {routes.map((r: RouteInfo) => (
            <Box display="flex" flexDirection="row" key={r.path}>
              <Link onClick={this.push(r.path)}>{r.path}</Link>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  render() {
    return (
      <Box>
        {this.renderDebugActions()}
        {this.renderRoutes()}
      </Box>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any): any => {
  return {}
}

// $FlowFixMe
export default connect(mapStateToProps)(Debug)
