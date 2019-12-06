//@flow
import React, {Component} from 'react'

import {Avatar, Box, Typography} from '@material-ui/core'

import type {InboxRow} from './types'

type Props = {
  row: InboxRow,
  index: number,
  selectRow: (row: InboxRow, index: number) => *,
}

type State = {
  hover: boolean,
}

export default class Row extends Component<Props, State> {
  state = {
    hover: false,
  }

  toggleHover = () => {
    this.setState({hover: !this.state.hover})
  }

  render() {
    const {row, index, selectRow} = this.props
    const key = row.inbox.kid
    let name = row.inbox.name

    // const avatarInitials = name && name.length > 2 ? name[0] + name[name.length - 1] : '?'
    let snippet = row.inbox.snippet ? row.inbox.snippet : 'no messages'
    let snippetColor = '#afafaf'

    if (row.inbox.error) {
      name = row.inbox.kid
      snippet = row.inbox.error
      snippetColor = '#ffafaf'
    }

    let rowStyle = styles.inbox
    if (row.selected) {
      rowStyle = {...rowStyle, ...styles.inboxSelected}
    }
    if (this.state.hover) {
      rowStyle = {...rowStyle, ...styles.inboxHover}
    }

    return (
      <Box
        display="flex"
        flexDirection="row"
        onClick={() => selectRow(row, index)}
        key={key}
        style={rowStyle}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
      >
        <Box style={{paddingLeft: 10}}>
          <Typography style={{...styles, color: 'white'}}>{name}</Typography>
          <Typography style={{color: snippetColor}} noWrap>
            {snippet}
          </Typography>
        </Box>
      </Box>
    )
  }
}

const styles = {
  inbox: {
    marginLeft: 6,
    marginRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 2,
  },
  inboxSelected: {
    backgroundColor: '#42464d',
    borderRadius: 8,
    marginLeft: 6,
    marginRight: 6,
  },
  inboxHover: {
    cursor: 'pointer',
    backgroundColor: '#42464d',
    borderRadius: 8,
    marginLeft: 6,
    marginRight: 6,
  },
}
