import * as React from 'react'

import {Box, Button, FormControl, FormHelperText, Input, Typography} from '@material-ui/core'

import {Link, Snack, SnackOpts} from '../../components'

import {UpdateAlertView} from '../update/alert'

import {ipcMain} from 'electron'

type Props = {}

type State = {
  openSnack: SnackOpts
  openUpdateAlert: boolean
}

export default class StyleGuide extends React.Component<Props, State> {
  state = {
    openSnack: null,
    openUpdateAlert: false,
  }

  closeSnack = () => {
    this.setState({openSnack: null})
  }

  updateAlert = () => {
    this.setState({openUpdateAlert: true})
  }

  render() {
    return (
      <Box
        display="flex"
        flex={1}
        flexDirection="column"
        style={{paddingLeft: 20}} // , backgroundColor: '#efefef'
      >
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
            <FormHelperText id="component-error-text" />
          </FormControl>
        </Box>

        <Box marginBottom={2}>
          <Link span onClick={() => this.setState({openSnack: {message: 'Testing'}})}>
            Snack Test
          </Link>
          <br />
          <Link span onClick={() => this.setState({openSnack: {message: 'Testing', alert: 'success'}})}>
            Snack Test (alert, success)
          </Link>
          <br />
          <Link span onClick={() => this.setState({openSnack: {message: 'Testing', alert: 'info'}})}>
            Snack Test (alert, info)
          </Link>
          <br />
          <Link span onClick={() => this.setState({openSnack: {message: 'Testing', alert: 'warning'}})}>
            Snack Test (alert, warning)
          </Link>
          <br />
          <Link
            span
            onClick={() =>
              this.setState({
                openSnack: {
                  message: 'Testing error message error message error message error message error message',
                  alert: 'error',
                },
              })
            }
          >
            Snack Test (alert, error)
          </Link>
          <br />
          <Snack
            open={!!this.state.openSnack}
            onClose={this.closeSnack}
            message={this.state.openSnack?.message}
            alert={this.state.openSnack?.alert}
            duration={this.state.openSnack?.duration}
          />
        </Box>

        <Box>
          <Link span onClick={this.updateAlert}>
            Update Alert
          </Link>
          <br />
          <UpdateAlertView
            open={this.state.openUpdateAlert}
            close={() => this.setState({openUpdateAlert: false})}
            version={'1.2.3'}
            apply={() => {}}
          />
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
