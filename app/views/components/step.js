// @flow
import React, {Component} from 'react'

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

import {styles} from '../components'

type Action = {
  action: any,
  label: string,
}

type Props = {
  title?: string,
  children?: any,
  prev?: Action,
  next?: Action,
  close?: Action, // TODO: implement close
  style?: any,
  loading?: boolean,
}

export default class Step extends Component<Props> {
  render() {
    const {prev, next, loading} = this.props
    const hasButtons = prev || next
    const title = this.props.title || ''
    const style = this.props.style || {}
    return (
      <Box display="flex" flexGrow={1} flexDirection="column" style={{marginLeft: 10, marginRight: 10}}>
        {title !== '' && (
          <Box
            display="flex"
            flexDirection="column"
            style={{
              marginBottom: 16,
            }}
          >
            <Box style={{width: '100%', maxWidth: 600, alignSelf: 'center'}}>
              <Typography
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                {title}
              </Typography>
            </Box>
            <Box style={{marginLeft: -10, marginRight: -10}}>
              {!loading && <Divider style={{marginBottom: 3}} />}
              {loading && <LinearProgress />}
            </Box>
          </Box>
        )}

        <Box
          display="flex"
          flexDirection="column"
          style={{
            width: '100%',
            maxWidth: 600,
            alignSelf: 'center',
            ...style,
          }}
        >
          <Box style={{paddingLeft: 20, paddingRight: 20}}>{this.props.children}</Box>
        </Box>

        {hasButtons && (
          <Box
            display="flex"
            flexDirection="row"
            style={{
              height: 50,
              paddingLeft: 20,
              paddingRight: 20,
              alignSelf: 'center',
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
