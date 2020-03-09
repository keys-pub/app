import * as React from 'react'

import {FormControl, MenuItem, Select, Typography} from '@material-ui/core'

import {CSSProperties} from '@material-ui/styles'

type Props = {
  service: string
  setService: (service: string) => void
  size?: 'small' | ''
}

export default (props: Props) => {
  const setService = (event: React.ChangeEvent<{value: unknown}>) => {
    const service = event.target.value as string
    props.setService(service)
  }

  const styles: CSSProperties = {width: 200}
  switch (props.size) {
    case 'small':
      styles.height = 30
  }

  return (
    <FormControl variant="outlined">
      <Select value={props.service} onChange={setService} style={styles}>
        <MenuItem value={'github'}>
          <Typography>Link to Github</Typography>
        </MenuItem>
        <MenuItem value={'twitter'}>
          <Typography>Link to Twitter</Typography>
        </MenuItem>
        <MenuItem value={'reddit'}>
          <Typography>Link to Reddit</Typography>
        </MenuItem>
      </Select>
    </FormControl>
  )
}
