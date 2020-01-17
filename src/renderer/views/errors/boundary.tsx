import * as React from 'react'

import {Box} from '@material-ui/core'

import {styles} from '../components'

import ErrorView from './view'

import {Button, Typography} from '@material-ui/core'

type Props = {
  children: any
}

type State = {
  error: Error
  errorInfo: any
}

export default class ErrorBoundaryView extends React.Component<Props, State> {
  state = {
    error: null,
    errorInfo: null,
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(error)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }
    const date = new Date().toString()
    return (
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: 'white',
          height: '100%',
        }}
      >
        <ErrorView error={this.state.error} errorInfo={this.state.errorInfo} />
      </Box>
    )
  }
}

const pre = {
  ...styles.mono,
  marginBottom: 20,
  whiteSpace: 'pre-wrap',
  overflow: 'auto',
  maxWidth: 600,
  width: 600,
  backgroundColor: 'black',
  color: '#efefef',
  paddingLeft: 10,
  paddingTop: 10,
  paddingBottom: 10,
}
