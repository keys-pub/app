import * as React from 'react'

import {Box, Typography} from '@material-ui/core'

type Props = {
  onClick: () => any
  children: any
  style?: React.CSSProperties
  inline?: boolean
  span?: boolean
  color?: string
}

const defaultStyles = {
  textDecoration: 'none',
  cursor: 'pointer',
}

const Link = (props: Props) => {
  const [hover, setHover] = React.useState(false)
  const on = () => setHover(true)
  const off = () => setHover(false)

  const style = {...defaultStyles, ...(props.style || {})}
  if (hover) {
    style.textDecoration = hover ? 'underline' : 'none'
  }
  if (props.inline) {
    style.display = 'inline'
  }
  if (props.color == 'secondary') {
    style.color = '#f50057'
  } else {
    style.color = '#2196f3'
  }
  if (props.span) {
    return (
      <span onClick={props.onClick} onMouseEnter={on} onMouseLeave={off} style={style}>
        {props.children}
      </span>
    )
  }

  return (
    <Typography onClick={props.onClick} onMouseEnter={on} onMouseLeave={off} style={style}>
      {props.children}
    </Typography>
  )
}

export default Link
