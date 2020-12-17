import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'

import Link from '../components/link'
import {ipcRenderer} from 'electron'

import {creds} from '../rpc/client'
import {openSnack} from '../snack'
import ChangePasswordDialog from '../auth/change-password'
import {contentTop} from '../theme'

export default (props: {}) => {
  const [prerelease, setPrerelease] = React.useState(false)
  const [version, setVersion] = React.useState('')
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)

  const onPrereleaseChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    setPrerelease(checked)
    ipcRenderer.send('electron-store-set', {key: 'prerelease', value: checked ? '1' : ''})
  }, [])

  React.useEffect(() => {
    const isPrerelease = async () => {
      const prerelease = await ipcRenderer.invoke('electron-store-get', 'prerelease')
      setPrerelease(prerelease == '1')
    }
    isPrerelease()
  }, [])

  React.useEffect(() => {
    const appVersion = async () => {
      const version: string = await ipcRenderer.invoke('version')
      setVersion(version)
    }
    appVersion()
  }, [])

  const labelWidth = 60
  return (
    <Box display="flex" flex={1} flexDirection="column" style={{marginTop: contentTop}}>
      <Typography variant="h4" style={{marginLeft: 10, paddingBottom: 10}}>
        Settings
      </Typography>

      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell style={{...cellStyles, width: labelWidth}}>
              <Typography align="right">Version</Typography>
            </TableCell>
            <TableCell style={cellStyles}>
              <Typography>{version}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell style={{...cellStyles, width: labelWidth}}>
              <Typography align="right">Updater</Typography>
            </TableCell>
            <TableCell style={cellStyles}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={prerelease}
                    color="primary"
                    onChange={onPrereleaseChange}
                    style={{paddingTop: 0, paddingBottom: 0}}
                  />
                }
                label="Prereleases"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell style={cellStyles}>
              <Typography align="right"></Typography>
            </TableCell>
            <TableCell style={cellStyles}>
              <Box display="flex" flexDirection="column">
                <Link onClick={() => setChangePasswordOpen(true)}>Change Password</Link>
              </Box>
            </TableCell>
          </TableRow>

          {process.env.NODE_ENV === 'development' && (
            <TableRow>
              <TableCell style={cellStyles}>
                <Typography align="right">Token</Typography>
              </TableCell>
              <TableCell style={cellStyles}>
                <Box display="flex" flexDirection="column">
                  <Typography variant="body2">{creds.token}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {changePasswordOpen && (
        <ChangePasswordDialog
          open={true}
          close={(snack?: string) => {
            if (snack) openSnack({message: snack, alert: 'success', duration: 4000})
            setChangePasswordOpen(false)
          }}
        />
      )}
    </Box>
  )
}

const cellStyles = {
  borderBottom: 0,
  paddingBottom: 10,
  verticalAlign: 'top',
}
