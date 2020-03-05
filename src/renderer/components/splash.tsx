import * as React from 'react'

import {Box, CircularProgress} from '@material-ui/core'

type Props = {
  delay: number
}
type State = {
  loading: boolean
}

export default class Splash extends React.Component<Props, State> {
  state = {
    loading: false,
  }
  tid: any // NodeJS.Timeout

  componentDidMount() {
    this.tid = setTimeout(() => {
      this.setState({loading: true})
    }, this.props.delay)
  }

  componentWillUnmount() {
    clearTimeout(this.tid)
  }

  render() {
    return (
      <Box
        display="flex"
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{height: '100%'}}
      >
        {this.state.loading && <CircularProgress size={128} />}
      </Box>
    )
  }
}
