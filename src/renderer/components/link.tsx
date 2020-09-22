import * as React from 'react'
import {CSSProperties} from 'react'

import {Box, Typography} from '@material-ui/core'
import {shell} from 'electron'
import {primary, secondary} from '../theme'

type Props = {
  onClick?: () => any
  children: any
  style?: React.CSSProperties
  inline?: boolean
  span?: boolean
  color?: string
  href?: string
  disabled?: boolean
}

const Link = (props: Props) => {
  const [hover, setHover] = React.useState(false)
  const on = () => setHover(true)
  const off = () => setHover(false)

  let style: CSSProperties = {}
  if (hover && !props.disabled) {
    style.textDecoration = 'underline'
    style.cursor = 'pointer'
  } else {
    style.cursor = 'default'
  }

  let tstyle: CSSProperties = {}
  if (props.inline) {
    tstyle.display = 'inline'
  }
  if (props.color == 'secondary') {
    style.color = secondary
  } else {
    style.color = primary
  }

  let onClick = props.onClick
  if (props.href) {
    onClick = () => shell.openExternal(props.href || '')
  }
  if (props.disabled) {
    onClick = undefined
    style.color = '#666'
  }

  if (props.span) {
    return (
      <span onClick={onClick} onMouseEnter={on} onMouseLeave={off} style={{...props.style, ...style}}>
        {props.children}
      </span>
    )
  }

  return (
    <Typography style={{...tstyle, ...props.style}}>
      <span onClick={onClick} onMouseEnter={on} onMouseLeave={off} style={style}>
        {props.children}
      </span>
    </Typography>
  )
}

export default Link
