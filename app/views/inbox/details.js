//@flow
import React from 'react'

import {Box, Typography} from '@material-ui/core'

export const RowVertComp = (key: string, value: any) => {
  return (
    <Box key={key} style={{paddingBottom: 20, paddingLeft: 20, paddingRight: 10}}>
      <Typography style={{fontWeight: 'bold'}}>{key}</Typography>
      <Typography
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export const RowVert = (key: string, value: string) => {
  const val = value.match(/.{1,10}/g)
  const valc = <div>{val && val.map(t => <span>{t}</span>)}</div>
  return RowVertComp(key, valc)
}

export const RowHorizComp = (key: string, value: any) => {
  return (
    <Box key={key} style={{paddingBottom: 20, paddingRight: 10}}>
      <Box display="flex" flex={1} flexDirection="row">
        <Typography
          style={{width: '20%', minWidth: '20%', alignSelf: 'bottom', fontWeight: 'bold'}}
          align="right"
        >
          {key} &nbsp;
        </Typography>
        <Typography
          style={{
            alignSelf: 'center',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            maxWidth: '75%',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

export const RowHoriz = (key: string, value: string) => {
  const val = value.match(/.{1,10}/g)
  const valc = <span>{val && val.map(t => <span>{t}</span>)}</span>
  return RowHorizComp(key, valc)
}
