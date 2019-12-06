// @flow
import React, {Component} from 'react'

import {styles} from '../components'

import {Box, Button, CircularProgress, Divider, Input} from '@material-ui/core'

export type Props = {
  defaultValue: ?string,
  error: ?string,
  submitEditing: (text: string) => boolean,
  clearError: () => void,
}

type State = {
  value: string,
}

export default class MessageInputView extends Component<Props, State> {
  state = {
    value: this.props.defaultValue || '',
  }

  onKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      this.submitEditing()
    }
  }

  submitEditing = () => {
    const text = this.state.value
    const ok = this.props.submitEditing(text)
    if (ok) {
      this.setState({
        value: '',
      })
    }
  }

  onChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      value: e.target.value,
    })
  }

  render() {
    return (
      <Box>
        <Divider />
        <Box
          display="flex"
          flex={1}
          flexDirection="row"
          alignItems="center"
          style={{
            paddingLeft: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingRight: 5,

            width: '100%',
          }}
        >
          <Input
            style={styles.messageInput}
            autoFocus
            disableUnderline
            fullWidth
            multiline
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            rows={1}
            rowsMax={5}
            value={this.state.value}
          />
        </Box>
      </Box>
    )
  }
}
