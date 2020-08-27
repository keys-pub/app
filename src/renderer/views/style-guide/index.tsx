import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, Input, Typography} from '@material-ui/core'

import {Link} from '../../components'
import Header from '../header'
import Snack, {SnackProps} from '../../components/snack'
import {UpdateAlertView} from '../update/alert'

export default (_: {}) => {
  const [updateAlert, setUpdateAlert] = React.useState(false)
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Header />
      <Box display="flex" flexDirection="column" marginLeft={2}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h3">Header3</Typography>
          <Typography variant="h4">Header4</Typography>
          <Typography variant="h5">Header5</Typography>
          <Typography variant="h6">Header6</Typography>
        </Box>

        <Box display="flex" flexDirection="row" flexWrap="wrap">
          <Button color="primary" style={cstyles.item}>
            Primary
          </Button>
          <Button color="secondary" style={cstyles.item}>
            Secondary
          </Button>
          <Button variant="contained" color="primary" style={cstyles.item}>
            Primary
          </Button>
          <Button variant="contained" color="secondary" style={cstyles.item}>
            Secondary
          </Button>
          <Button variant="outlined" color="primary" style={cstyles.item}>
            Primary
          </Button>
          <Button variant="outlined" color="secondary" style={cstyles.item}>
            Secondary
          </Button>
          <Button variant="contained" color="primary" disabled={true} style={cstyles.item}>
            Primary
          </Button>
          <Button variant="contained" color="secondary" disabled={true} style={cstyles.item}>
            Secondary
          </Button>
          <Box>
            <Button variant="contained" color="primary" size="small" style={cstyles.item}>
              Primary Small
            </Button>
            <Button variant="contained" color="secondary" size="small" style={cstyles.item}>
              Secondary Small
            </Button>
          </Box>
          <Button variant="contained" color="primary" size="large" style={cstyles.item}>
            Primary Large
          </Button>
          <Button variant="contained" color="secondary" size="large" style={cstyles.item}>
            Secondary Large
          </Button>

          <Button color="primary" fullWidth={true} style={cstyles.item}>
            Primary (Full Width)
          </Button>
          <Button color="secondary" fullWidth={true} style={cstyles.item}>
            Secondary (Full Width)
          </Button>
        </Box>

        <Box style={{width: 300, marginBottom: 20}}>
          <FormControl>
            <Input placeholder="placeholder" />
            <FormHelperText />
          </FormControl>
        </Box>

        <Box marginBottom={2}>
          <Link span onClick={() => openSnack({message: 'Testing'})}>
            Snack Test
          </Link>
          <br />
          <Link span onClick={() => openSnack({message: 'Testing', alert: 'success', duration: 1000})}>
            Snack Test (alert, success)
          </Link>
          <br />
          <Link span onClick={() => openSnack({message: 'Testing', alert: 'info', duration: 2000})}>
            Snack Test (alert, info)
          </Link>
          <br />
          <Link span onClick={() => openSnack({message: 'Testing', alert: 'warning', duration: 3000})}>
            Snack Test (alert, warning)
          </Link>
          <br />
          <Link
            span
            onClick={() =>
              openSnack({
                message: 'Testing error message error message error message error message error message',
                alert: 'error',
              })
            }
          >
            Snack Test (alert, error)
          </Link>
          <br />
          <Snack
            open={snackOpen}
            {...snack}
            onClose={() => {
              setSnackOpen(false)
            }}
          />
        </Box>

        <Box>
          <Link span onClick={() => setUpdateAlert(true)}>
            Update Alert
          </Link>
          <br />
          <UpdateAlertView
            open={updateAlert}
            close={() => setUpdateAlert(false)}
            version={'1.2.3'}
            apply={() => {}}
          />
        </Box>
      </Box>
    </Box>
  )
}

const cstyles = {
  item: {
    marginRight: 10,
    marginBottom: 10,
  },
}
