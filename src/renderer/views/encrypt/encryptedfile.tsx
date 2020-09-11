import * as React from 'react'

import {Button, Divider, Input, Box, Typography} from '@material-ui/core'

import {Link} from '../../components'

import {shell} from 'electron'

export type Props = {
  fileOut: string
}

export default (props: Props) => {
  const openFolder = () => {
    shell.showItemInFolder(props.fileOut)
  }

  return (
    <Box display="flex" flexDirection="column" flex={1} style={{height: '100%'}}>
      <Box style={{paddingLeft: 10, paddingTop: 10}}>
        <Typography variant="body2" style={{display: 'inline'}}>
          {props.fileOut}&nbsp;
        </Typography>
        <Link inline onClick={openFolder}>
          Open Folder
        </Link>
      </Box>
    </Box>
  )
}
