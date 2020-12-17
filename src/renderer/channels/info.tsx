import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Typography,
} from '@material-ui/core'

import {CloseIcon, InfoIcon} from '../icons'
import {breakWords} from '../theme'

import {Channel} from '@keys-pub/tsclient/lib/keys'

type Props = {
  open: boolean
  onClose: () => void
  channel: Channel
}

export default (props: Props) => {
  return (
    <Drawer anchor="right" open={props.open} onClose={props.onClose}>
      <Box paddingLeft={2} position="relative" style={{width: 400}}>
        <Box position="absolute" right={6} top={6}>
          <IconButton size="small" color="secondary" onClick={props.onClose}>
            <CloseIcon fontSize="small" style={{color: '#666'}} />
          </IconButton>
        </Box>
        <Typography variant="h4" style={{paddingTop: 10, paddingBottom: 6, fontWeight: 500}}>
          Channel Info
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography align="right">ID</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" style={{width: 260, ...breakWords}}>
                  {props.channel.id}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography align="right">Name</Typography>
              </TableCell>
              <TableCell>
                <Typography style={{width: 260, ...breakWords}}>{props.channel.name}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Drawer>
  )
}
