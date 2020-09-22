import * as React from 'react'

import {Box, Button, Typography} from '@material-ui/core'

import Dialog from '../../components/dialog'

import {authDeprovision} from '../../rpc/keys'
import {AuthProvision} from '../../rpc/keys.d'
import {authTypeDescription} from '../helper'
import {dateString} from '../../helper'
import {mono, breakWords} from '../../theme'

type Props = {
  open: boolean
  provision?: AuthProvision
  close: (removed: boolean) => void
}

export default (props: Props) => {
  if (!props.provision) return null
  const {provision} = props

  const deprovision = async () => {
    const resp = await authDeprovision({id: provision?.id})
    props.close(true)
  }

  return (
    <Dialog
      title="Deprovision"
      close={{label: 'Close', action: () => props.close(false)}}
      open={props.open}
      actions={[{label: 'Deprovision', color: 'primary', action: deprovision}]}
    >
      <Box>
        <Typography style={{paddingBottom: 10}}>
          Do you want to remove the {authTypeDescription(provision.type)} created on{' '}
          <Box display="inline" style={mono}>
            {dateString(provision.createdAt)}
          </Box>
          ?
        </Typography>
      </Box>
    </Dialog>
  )
}
