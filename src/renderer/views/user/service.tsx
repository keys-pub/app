import * as React from 'react'
import {CSSProperties} from 'react'

import {FormControl, MenuItem, Select, TextField, Typography} from '@material-ui/core'

type Props = {
  service: string
  setService: (service: string) => void
}

export default (props: Props) => {
  const setService = React.useCallback((event: React.SyntheticEvent<EventTarget>) => {
    let target = event.target as HTMLInputElement
    const service = target.value
    props.setService(service)
  }, [])

  const styles: CSSProperties = {width: 200, height: 31}
  console.log('foo')

  return (
    <FormControl variant="outlined">
      <TextField
        variant="outlined"
        select
        value={props.service}
        onChange={setService}
        id="userServiceSelect"
        inputProps={{
          style: styles,
        }}
      >
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
        <MenuItem value={'echo'}>
          <Typography>Link to Echo</Typography>
        </MenuItem>
      </TextField>
    </FormControl>
  )
}
