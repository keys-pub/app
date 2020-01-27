//@flow
import * as React from 'react'

import {Avatar, Box, Button, Divider, Typography} from '@material-ui/core'
import {styles} from '../../components'

import {Message, User} from '../../rpc/types'
import {MessageRow} from './types'

type Props = {
  row: MessageRow
  index: number
  selectMessage: (r: MessageRow, index: number) => any
  follow: (r: MessageRow, index: number) => any
}
type State = {
  hover: boolean
}

export default class MessageView extends React.Component<Props, State> {
  state = {
    hover: false,
  }

  toggleHover = () => {
    this.setState({hover: !this.state.hover})
  }

  render() {
    const {row, index, selectMessage, follow} = this.props
    if (!row.message.user) {
      console.warn('No user for message row:', row)
      return null
    }

    const key = row.message.id + index

    let textColor = '#212529'
    let timeColor = '#bfbfbf'
    if (row.pending) {
      textColor = '#afafaf'
    }

    // User styles
    const user: User = row.message.user
    let nameColor = 'green'
    // nameColor = '#2196f3'
    // nameColor = 'green' // #2196f3 #339933
    const userStyles = {
      ...styles.mono,
      color: nameColor,
      textDecoration: 'default',
    }
    // if (user.self) {
    //   userStyles.textDecoration = 'underline dotted'
    // }

    let rowStyle = {}
    if (row.selected) {
      timeColor = '#212529'
      rowStyle = {
        ...rowStyle,
        backgroundColor: '#f3f3f3',
      }
    }
    if (this.state.hover) {
      rowStyle = {
        ...rowStyle,
        backgroundColor: '#f6f6f6',
      }
    }

    const timeDisplay = row.message.timeDisplay
    const dateDisplay = row.message.dateDisplay
    const avatarSize = 6
    const left = 8

    let fontStyle = 'default'

    // fontStyle = 'italic'
    // textColor = '#888'

    return (
      <Box
        display="flex"
        flex={1}
        flexDirection="row"
        style={{...rowStyle}}
        key={key}
        onClick={() => selectMessage(row, index)}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
      >
        <Box display="flex" flex={1} flexDirection="column" style={{marginLeft: 12}}>
          <Box display="flex" flex={1} flexDirection="row" style={{marginTop: 8}}>
            {user && (
              <Typography style={{...userStyles, paddingLeft: left, fontSize: 12}}>
                {user.name}@{user.service}
              </Typography>
            )}

            <Typography
              style={{
                color: timeColor,
                fontSize: 11,
                alignSelf: 'center',
                marginTop: 2,
                paddingLeft: 8,
              }}
            >
              {timeDisplay}
              &nbsp;
              {dateDisplay}
            </Typography>
          </Box>
          {row.message.content && (
            <Typography
              style={{
                paddingTop: 0,
                paddingBottom: 8,
                paddingLeft: left,
                paddingRight: 5,
                color: textColor,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontStyle,
              }}
            >
              {row.message.content.text}
            </Typography>
          )}
          {/* {row.selected && (
          <Box style={{paddingBottom: 10}}>
            <Box display="flex" flexDirection="row">
              <Box
                style={{cursor: 'pointer'}}
                onClick={e => {
                  e.stopPropagation()
                  follow(row, index)
                }}
              >
                <Typography style={{color: 'blue', marginLeft: 30}}>Follow</Typography>
              </Box>
            </Box>
          </Box>
        )} */}
        </Box>
      </Box>
    )
  }
}
