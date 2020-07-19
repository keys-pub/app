import * as React from 'react'
import {CSSProperties} from 'react'

import {FormControl, MenuItem, Select, Typography} from '@material-ui/core'

type Props = {
  service: string
  setService: (service: string) => void
}

export default (props: Props) => {
  const setService = (event: React.ChangeEvent<{value: unknown}>) => {
    const service = event.target.value as string
    props.setService(service)
  }

  const styles: CSSProperties = {width: 200}

  return (
    <FormControl variant="outlined">
      <Select value={props.service} onChange={setService} style={{...styles, height: 31}}>
        <MenuItem value={'github'}>
          <Typography>Link to Github</Typography>
        </MenuItem>
        <MenuItem value={'twitter'}>
          <Typography>Link to Twitter</Typography>
        </MenuItem>
        <MenuItem value={'reddit'}>
          <Typography>Link to Reddit</Typography>
        </MenuItem>
        <MenuItem value={'https'}>
          <Typography>Link to Website (HTTPS)</Typography>
        </MenuItem>
      </Select>
    </FormControl>
  )
}
