// @flow
import React, {Component} from 'react'

import {Box, Button, Divider, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {styles, Link} from '../components'
import {NamesView} from '../profile/user/views'

import {connect} from 'react-redux'
import queryString from 'query-string'

import {keyTypeString, keyTypeSymbol, dateString} from '../helper'

import {status} from '../../rpc/rpc'
import type {AppState, RPCState} from '../../reducers/app'

import type {Key, KeyType} from '../../rpc/types'

type Props = {
  value: Key,
  add: () => void,
  remove: () => void,
}

const cstyles = {
  cell: {
    borderBottom: 0,
    paddingBottom: 20,
    verticalAlign: 'top',
  },
}

export const KeyTypeView = (props: {type: KeyType, description: boolean}) => {
  return <Typography>{props.description ? keyTypeString(props.type) : keyTypeSymbol(props.type)}</Typography>
}

export default (props: Props) => {
  const kid = props.value.kid
  const add = !props.value.saved && props.value.type == 'PUBLIC_KEY_TYPE'
  const remove = props.value.saved && props.value.type == 'PUBLIC_KEY_TYPE'
  const users = props.value.users || []
  const type = props.value.type || 'NO_KEY_TYPE'
  const createdAt = dateString(props.value.createdAt)
  const publishedAt = dateString(props.value.publishedAt)
  const savedAt = dateString(props.value.savedAt)
  const updatedAt = dateString(props.value.updatedAt)
  return (
    <Box display="flex">
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell style={{...cstyles.cell, width: 100}}>
              <Typography align="right">ID</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="column">
                <Typography style={{...styles.mono, paddingRight: 10, wordWrap: 'break-word'}}>
                  {kid}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}>
              <Typography align="right">{users.length < 2 ? 'User' : 'Users'}</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              {users.length > 0 && (
                <Box display="flex" flexDirection="column">
                  <NamesView users={users} />
                  {
                    //<Link onClick={() => shell.openExternal(user.url)}>{user.url}</Link>
                  }
                </Box>
              )}
              {users.length == 0 && <Typography style={{color: '#9f9f9f'}}>none</Typography>}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}>
              <Typography align="right">Type</Typography>
            </TableCell>
            <TableCell style={cstyles.cell}>
              <KeyTypeView type={type} description />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="column">
                <Typography align="right">Created</Typography>
                <Typography align="right">Published</Typography>
                <Typography align="right">Saved</Typography>
                <Typography align="right">Updated</Typography>
              </Box>
            </TableCell>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="column">
                <Typography>{createdAt || '-'}</Typography>
                <Typography>{publishedAt || '-'}</Typography>
                <Typography>{savedAt || '-'}</Typography>
                <Typography>{updatedAt || '-'}</Typography>
              </Box>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={cstyles.cell}></TableCell>
            <TableCell style={cstyles.cell}>
              <Box display="flex" flexDirection="row">
                {add && (
                  <Button size="small" color="primary" variant="outlined" onClick={props.add}>
                    Add
                  </Button>
                )}
                {remove && (
                  <Button size="small" color="secondary" variant="outlined" onClick={props.remove}>
                    Remove
                  </Button>
                )}
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}
