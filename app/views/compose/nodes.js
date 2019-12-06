// @flow
import * as React from 'react'
import {Editor} from 'slate'

import {Divider, Typography} from '@material-ui/core'

import type {SlateNodeProps} from './types'

function renderNode(props: SlateNodeProps, editor: Editor, next: Function) {
  const {attributes} = props

  const hidden = props.node.data.get('hidden')
  if (hidden) attributes.style = {display: 'none'}

  switch (props.node.type) {
    case 'paragraph':
      return <Typography>{props.children}</Typography>
    // case 'block-toolbar':
    //   return <BlockToolbar {...props} />
    case 'block-quote':
      return <blockquote {...attributes}>{props.children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{props.children}</ul>
    case 'ordered-list':
      return <ol {...attributes}>{props.children}</ol>
    // case 'todo-list':
    //   return <TodoList {...attributes}>{props.children}</TodoList>
    case 'table':
      return <table {...attributes}>{props.children}</table>
    case 'table-row':
      return <tr {...attributes}>{props.children}</tr>
    case 'table-head':
      return <th {...attributes}>{props.children}</th>
    case 'table-cell':
      return <td {...attributes}>{props.children}</td>
    case 'list-item':
      return <li {...props} />
    case 'horizontal-rule':
      // {...props}
      return <Divider />
    case 'code':
      return <code {...props} />
    case 'code-line':
      return <pre {...attributes}>{props.children}</pre>
    // case 'image':
    //   return <Image {...props} />
    // case 'link':
    //   return <Link {...props} />
    case 'heading1':
      return <Typography variant="h4">{props.children}</Typography>
    case 'heading2':
      return <Typography variant="h5">{props.children}</Typography>
    case 'heading3':
      return <Typography variant="h6">{props.children}</Typography>
    case 'heading4':
      return <Typography variant="h6">{props.children}</Typography>
    case 'heading5':
      return <Typography variant="h6">{props.children}</Typography>
    case 'heading6':
      return <Typography variant="h6">{props.children}</Typography>
    default:
      return next()
  }
}

export default {renderNode}
