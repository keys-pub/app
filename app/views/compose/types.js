// @flow
import * as React from 'react'
import {Value, Editor, Node, Mark as TMark} from 'slate'
import {ReactEditor} from 'slate-react'

export type SlateNodeProps = {
  children: React.Node,
  readOnly: boolean,
  attributes: Object,
  value: Value,
  editor: ReactEditor,
  node: Node,
  parent: Node,
  mark: TMark,
  isSelected: boolean,
}

export type Plugin = {
  validateNode?: (Node, Editor, Function) => *,
  onClick?: (SyntheticEvent<*>) => *,
  onKeyDown?: (SyntheticKeyboardEvent<*>, Editor, Function) => *,
}

export type SearchResult = {
  title: string,
  url: string,
}

export type Block =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'block-quote'
  | 'code'
  | 'code'
  | 'horizontal-rule'
  | 'bulleted-list'
  | 'ordered-list'
  | 'todo-list'
  | 'image'

export type Mark = 'bold' | 'italic' | 'deleted' | 'code' | 'link'
