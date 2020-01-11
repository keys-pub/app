// @flow
import {Editor} from 'slate-react'
import {Value} from 'slate'

import React from 'react'

import {styles} from '../components'

import MarkdownSerializer from 'slate-md-serializer'

import createPlugins from './plugins'

import {Box, Button, Divider} from '@material-ui/core'

import Formatter from './formatter'

type Props = {
  defaultValue: string,
  loading: boolean,
  action: (value: string) => *,
  actionLabel: string,
  onChange?: (value: () => string) => *,
}

type State = {
  editorValue: any,
}

const Markdown = new MarkdownSerializer()
const plugins = createPlugins({placeholder: '', getLinkComponent: null})

class EditorView extends React.Component<Props, State> {
  state = {
    editorValue: Markdown.deserialize(this.props.defaultValue),
  }
  editor: Editor

  setEditorRef = (ref: Editor) => {
    this.editor = ref
  }

  onChange = ({value}: {value: Value}) => {
    this.setState({editorValue: value}, state => {
      if (this.props.onChange) {
        this.props.onChange(this.value)
      }
    })
  }

  createLink = (e: SyntheticEvent<*>) => {}

  value = (): string => {
    return Markdown.serialize(this.state.editorValue)
  }

  action = () => {
    this.props.action(this.value())
  }

  render() {
    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <Editor
          style={{flex: 1, paddingLeft: 10, paddingTop: 10}}
          spellCheck
          autoFocus
          placeholder=""
          ref={this.setEditorRef}
          value={this.state.editorValue}
          onChange={this.onChange}
          plugins={plugins}
        />
        <Divider />
        <Box
          display="flex"
          flexDirection="row"
          style={{
            paddingLeft: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingRight: 20,
          }}
        >
          <Button color="primary" variant="outlined" onClick={this.action} disabled={this.props.loading}>
            {this.props.actionLabel}
          </Button>
          <Box display="flex" flexDirection="row" flex={1} />
          {this.editor && <Formatter editor={this.editor} onCreateLink={this.createLink} />}
        </Box>
      </Box>
    )
  }
}

export default EditorView
