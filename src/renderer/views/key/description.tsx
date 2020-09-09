import * as React from 'react'

import {IDView} from './content'
import UserLabel from '../user/label'
import {Box, Button, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core'

import {Key, KeyType, User} from '../../rpc/keys.d'

type Props = {
  k: Key
}

export default (props: Props) => (
  <Box display="flex" flexDirection="column">
    <IDView id={props.k.id || ''} />
    {props.k.user && <UserLabel user={props.k.user} />}
  </Box>
)
