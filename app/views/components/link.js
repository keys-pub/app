// @flow
import React, {useState} from 'react'

import {Box, Typography} from '@material-ui/core'

type Props = {
  onClick: () => void,
  children: any,
  style?: any,
  inline?: boolean,
}

const styles = {
  color: '#2196f3',
  textDecoration: 'none',
  cursor: 'pointer',
}

const Link = (props: Props) => {
  const [hover, setHover] = useState(false)
  const on = () => setHover(true)
  const off = () => setHover(false)

  const style = {...styles, ...(props.style || {})}
  if (hover) {
    style['textDecoration'] = hover ? 'underline' : 'none'
  }

  if (props.inline) {
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
