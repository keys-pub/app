import React from 'react'
import {withStyles, Theme, makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Tooltip, {TooltipProps} from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[2],
    fontSize: 11,
  },
}))(Tooltip)

interface Props extends TooltipProps {
  dark?: boolean
}

const CustomTooltip = (props: Props) => {
  if (!props.enterDelay) {
    props = {...props, enterDelay: 800}
  }
  const dark = props.dark
  props.dark = undefined
  if (dark) {
    return <Tooltip {...props}>{props.children}</Tooltip>
  }
  return <LightTooltip {...props}>{props.children}</LightTooltip>
}

export default CustomTooltip
