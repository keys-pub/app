import * as React from 'react'

import {
  Box,
  Button,
  Divider,
  IconButton,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
  LinearProgress,
  Typography,
} from '@material-ui/core'

import {styles} from '.'

type Action = {
  action: any
  label: string
}

type Props = {
  title?: string
  children?: any
  prev?: Action
  next?: Action
  close?: Action // TODO: implement close
  style?: any
  loading?: boolean
}

export default class Step extends React.Component<Props> {
  render() {
    const {prev, next, loading} = this.props
    const hasButtons = prev || next
    const title = this.props.title || ''
    const style = this.props.style || {}
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" style={{marginLeft: 20, marginRight: 10}}>
        <Box style={{marginLeft: -20, marginRight: -10}}>
          {!loading && <Divider style={{marginBottom: 3}} />}
          {loading && <LinearProgress />}
        </Box>

        {title !== '' && (
          <Box
            display="flex"
            flexDirection="column"
            style={{
              paddingTop: 4,
              paddingBottom: 8,
            }}
          >
            <Box>
              <Typography
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          display="flex"
          flexDirection="column"
          style={{
            ...style,
          }}
        >
          <Box>{this.props.children}</Box>
        </Box>

        {hasButtons && (
          <Box
            display="flex"
            flexDirection="row"
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 20,
            }}
          >
            {prev && (
              <Button color="secondary" onClick={prev.action} disabled={this.props.loading}>
                {prev.label}
              </Button>
            )}
            <Box margin={1} />
            {next && (
              <Button color="primary" variant="outlined" onClick={next.action} disabled={this.props.loading}>
                {next.label}
              </Button>
            )}
          </Box>
        )}
        {!hasButtons && <Box style={{paddingBottom: 20}} />}
      </Box>
    )
  }
}
