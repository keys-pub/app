import * as React from 'react'

import {FormControl, MenuItem, Select, TextField, Typography} from '@material-ui/core'

type Props = {
  service: string
  setService: (service: string) => void
  small?: boolean
}

export default (props: Props) => {
  const setService = React.useCallback((event: React.SyntheticEvent<EventTarget>) => {
    let target = event.target as HTMLInputElement
    const service = target.value
    props.setService(service)
  }, [])

  const styles: React.CSSProperties = {width: 200}
  if (props.small) {
    styles.height = 31
  }

  return (
    <FormControl variant="outlined">
      <TextField
        variant="outlined"
        select
        value={props.service}
        onChange={setService}
        id="userServiceSelect"
        InputProps={{
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
        {process.env.KP_ECHO_ENABLED && (
          <MenuItem value={'echo'}>
            <Typography>Link to Echo</Typography>
          </MenuItem>
        )}
      </TextField>
    </FormControl>
  )
}
