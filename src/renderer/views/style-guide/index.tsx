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
    <Box display="flex" flex={1} flexDirection="column" style={{position: 'relative'}}>
      <Box
        display="flex"
        flexDirection="column"
        marginLeft={2}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, overflowY: 'auto'}}
      >
        <Box display="flex" flexDirection="column">
          <Typography variant="h3">Header3</Typography>
          <Typography variant="h4">Header4</Typography>
          <Typography variant="h5">Header5</Typography>
          <Typography variant="h6">Header6</Typography>
        </Box>

        <Typography paragraph>
          I'm baby church-key locavore helvetica narwhal cardigan cold-pressed vexillologist, mlkshk tousled
          live-edge tumeric pop-up irony blue bottle taxidermy. Shaman aesthetic letterpress, gentrify
          pitchfork plaid leggings 8-bit vinyl. Iceland green juice yr jianbing cronut. Man bun kogi franzen
          adaptogen 90's.
        </Typography>
        <Typography variant="body2" paragraph>
          Put a bird on it irony chillwave truffaut letterpress next level. Gentrify deep v gluten-free
          mumblecore. Sustainable banh mi trust fund activated charcoal cloud bread photo booth street art af.
          Mustache viral vexillologist lumbersexual, selvage sriracha lo-fi.
        </Typography>

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
          <Link onClick={() => openSnack({message: 'Testing'})}>Snack Test</Link>
          <Link onClick={() => openSnack({message: 'Testing', alert: 'success', duration: 1000})}>
            Snack Test (alert, success)
          </Link>
          <Link onClick={() => openSnack({message: 'Testing', alert: 'info', duration: 2000})}>
            Snack Test (alert, info)
          </Link>
          <Link onClick={() => openSnack({message: 'Testing', alert: 'warning', duration: 3000})}>
            Snack Test (alert, warning)
          </Link>
          <Link
            onClick={() =>
              openSnack({
                message: 'Testing error message error message error message error message error message',
                alert: 'error',
              })
            }
          >
            Snack Test (alert, error)
          </Link>
          <Snack
            open={snackOpen}
            {...snack}
            onClose={() => {
              setSnackOpen(false)
            }}
          />
        </Box>

        <Box>
          <Link onClick={() => setUpdateAlert(true)}>Update Alert</Link>
          <UpdateAlertView
            open={updateAlert}
            close={() => setUpdateAlert(false)}
            version={'1.2.3'}
            action={() => setUpdateAlert(false)}
            actionLabel="Download &amp; restart"
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
