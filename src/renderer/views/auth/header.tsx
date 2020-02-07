import * as React from 'react'

import {Box, Divider, LinearProgress, Typography} from '@material-ui/core'
import {Lock} from '@material-ui/icons'

import {styles} from '../../components'

type Props = {
  loading: boolean
  top?: number
}

export default (props: Props) => {
  return (
    <Box display="flex" flexDirection="column" style={{width: '100%', paddingBottom: 20}}>
      <Box className="drag" style={{height: 40, cursor: 'move'}} />
      <Box style={{height: props.top || 0}} />
      <Box display="flex" flexDirection="row" style={{alignSelf: 'center'}}>
        <Typography
          style={{
            fontFamily: 'Minercraftory',
            fontSize: 64,
            color: '#2196f3',
          }}
        >
          keys
        </Typography>
        {/*<Typography style={{fontSize: 48, fontWeight: 800, color: 'white'}}>.</Typography>
         */}
        {/* <Typography style={{fontSize: 48, fontWeight: 800, color: '#666666'}}>.pub</Typography> */}
      </Box>
      {!props.loading && <Divider style={{marginBottom: 3}} />}
      {props.loading && <LinearProgress />}
    </Box>
  )
}
