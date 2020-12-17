import * as React from 'react'
import {CSSProperties} from 'react'

import {Box, Button, CircularProgress, Divider, Input} from '@material-ui/core'

export type Props = {
  defaultValue: string
  submitEditing: (text: string) => void
  placeholder?: string
  disabledPlaceholder?: string
  disabled?: boolean
}

type State = {
  value: string
}

export default class TextInputView extends React.Component<Props, State> {
  state = {
    defaultValue: '',
    value: this.props.defaultValue || '',
  }

  onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      this.submitEditing()
    }
  }

  submitEditing = () => {
    const text = this.state.value
    this.props.submitEditing(text)
    this.setState({
      value: '',
    })
  }

  onChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({
      value: target.value,
    })
  }

  render() {
    const cstyles: CSSProperties = {}
    if (this.props.disabled) {
      cstyles.backgroundColor = '#efefef'
    }

    let placeholder = this.props.placeholder
    if (this.props.disabled && this.props.disabledPlaceholder) {
      placeholder = this.props.disabledPlaceholder
    }

    return (
      <Box
        display="flex"
        flex={1}
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          marginRight: 8,
        }}
      >
        <Box
          display="flex"
          flex={1}
          style={{
            ...cstyles,
            marginLeft: 10,
            marginRight: 10,
            marginTop: 10,
            marginBottom: 10,
            border: '1px solid #efefef',
            borderRadius: 10,
            paddingLeft: 8,
            paddingTop: 4,
            paddingBottom: 4,
            paddingRight: 5,
          }}
        >
          <Input
            autoFocus
            disableUnderline
            fullWidth
            multiline
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            rows={1}
            rowsMax={5}
            value={this.state.value}
            placeholder={placeholder}
            disabled={this.props.disabled}
          />
        </Box>
      </Box>
    )
  }
}
