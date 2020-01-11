// @flow
import {Editor} from 'slate-react'
import {Value} from 'slate'

import React from 'react'

import {styles} from '../components'

import {Box, Button, Divider, Icon, IconButton} from '@material-ui/core'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
  LooksOne,
  LooksTwo,
  FormatQuote,
  FormatListNumbered,
  FormatListBulleted,
} from '@material-ui/icons'

type Props = {
  editor: Editor,
  onCreateLink: (SyntheticEvent<*>) => *,
}

class Formatter extends React.Component<Props> {
  render() {
    return (
      <Box display="flex" flexDirection="row">
        {this.renderMarkButton('bold', <FormatBold />)}
        {this.renderMarkButton('italic', <FormatItalic />)}
        {this.renderMarkButton('underlined', <FormatUnderlined />)}
        {this.renderMarkButton('code', <Code />)}
        {this.renderBlockButton('heading1', <LooksOne />)}
        {this.renderBlockButton('heading2', <LooksTwo />)}
        {this.renderBlockButton('block-quote', <FormatQuote />)}
        {this.renderBlockButton('ordered-list', <FormatListNumbered />)}
        {this.renderBlockButton('bulleted-list', <FormatListBulleted />)}
      </Box>
    )
  }

  renderMarkButton = (type: any, icon: any) => {
    const isActive = this.hasMark(type)
    // const onMouseDown = ev => this.onClickMark(ev, type)

    return (
      <IconButton
        color={isActive ? 'primary' : 'default'}
        style={{marginRight: -10}}
        disableRipple
        onClick={event => this.onClickMark(event, type)}
      >
        {icon}
      </IconButton>
    )
  }

  renderBlockButton = (type: any, icon: any) => {
    const isActive = this.isBlock(type)
    // const onMouseDown = ev => this.onClickBlock(ev, isActive ? 'paragraph' : type)

    return (
      <IconButton
        color={isActive ? 'primary' : 'default'}
        disableRipple
        style={{marginRight: -10}}
        onClick={event => this.onClickBlock(event, type)}
      >
        {icon}
      </IconButton>
    )
  }

  hasMark = (type: string) => {
    try {
      return this.props.editor.value.marks.some(mark => mark.type === type)
    } catch (_err) {
      return false
    }
  }

  isBlock = (type: string) => {
    const startBlock = this.props.editor.value.startBlock
    return startBlock && startBlock.type === type
  }

  onClickMark = (ev: SyntheticEvent<*>, type: string) => {
    ev.preventDefault()
    ev.stopPropagation()

    const {editor} = this.props
    editor.toggleMark(type)

    // ensure we remove any other marks on inline code
    // we don't allow bold / italic / strikethrough code.
    const isInlineCode = this.hasMark('code') || type === 'code'
    if (isInlineCode) {
      editor.value.marks.forEach(mark => {
        if (mark.type !== 'code') editor.removeMark(mark)
      })
    }
  }

  onClickBlock = (ev: SyntheticEvent<*>, type: string) => {
    ev.preventDefault()
    ev.stopPropagation()

    this.props.editor.setBlocks(type)
  }

  handleCreateLink = (ev: SyntheticEvent<*>) => {
    ev.preventDefault()
    ev.stopPropagation()

    let selection = window.getSelection().toString()
    selection = selection.trim()

    if (selection.length) {
      const data = {href: ''}
      this.props.editor.wrapInline({type: 'link', data})
      this.props.onCreateLink(ev)
    }
  }
}

export default Formatter
