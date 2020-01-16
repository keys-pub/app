import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, Input} from '@material-ui/core'

export default class StyleGuide extends React.Component<{}, {}> {
  render() {
    return (
      <Box display="flex" flex={1} style={{paddingTop: 40, paddingLeft: 20, backgroundColor: '#efefef'}}>
        <Box display="flex" flexDirection="row" flexWrap="wrap">
          <Button color="primary" style={cstyles.item}>
            Primary
          </Button>
          <Button color="secondary" style={cstyles.item}>
            Secondary
          </Button>
          <Button variant="contained" color="primary" style={cstyles.item}>
            Primary Raised
          </Button>
          <Button variant="contained" color="secondary" style={cstyles.item}>
            Secondary Raised
          </Button>
          <Button variant="outlined" color="primary" style={cstyles.item}>
            Primary Outlined
          </Button>
          <Button variant="outlined" color="secondary" style={cstyles.item}>
            Secondary Outlined
          </Button>
          <Button variant="contained" color="primary" disabled={true} style={cstyles.item}>
            Primary Raised Disabled
          </Button>
          <Button variant="contained" color="secondary" disabled={true} style={cstyles.item}>
            Secondary Raised Disabled
          </Button>
          <Button variant="contained" color="primary" size="small" style={cstyles.item}>
            Primary Raised Small
          </Button>
          <Button variant="contained" color="secondary" size="small" style={cstyles.item}>
            Secondary Raised Small
          </Button>
          <Button variant="contained" color="primary" size="large" style={cstyles.item}>
            Primary Raised Large
          </Button>
          <Button variant="contained" color="secondary" size="large" style={cstyles.item}>
            Secondary Raised Large
          </Button>

          <Button color="primary" fullWidth={true} style={cstyles.item}>
            Primary (Full Width)
          </Button>
          <Button color="secondary" fullWidth={true} style={cstyles.item}>
            Secondary (Full Width)
          </Button>
        </Box>

        <Box style={{width: 300}}>
          <FormControl>
            <Input placeholder="placeholder" />
            <FormHelperText id="component-error-text" />
          </FormControl>
        </Box>
      </Box>
    )
  }
}

const cstyles = {
  item: {
    marginRight: 10,
    marginBottom: 10,
  },
}
