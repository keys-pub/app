import * as React from 'react'

import {Box, Button, DialogContentText, Divider, LinearProgress, Typography} from '@material-ui/core'
import Dialog from '../components/dialog'
import {openSnackError} from '../snack'

import {keys} from '../rpc/client'
import {StatementRevokeRequest, StatementRevokeResponse} from '@keys-pub/tsclient/lib/keys'

type Props = {
  kid: string
  open: boolean
  seq: number
  close: (revoked: boolean) => void
}

export default (props: Props) => {
  const [loading, setLoading] = React.useState(false)

  const revoke = async () => {
    setLoading(true)
    const req: StatementRevokeRequest = {
      kid: props.kid,
      seq: props.seq,
      local: false,
    }
    try {
      const resp = await keys.statementRevoke(req)
      props.close(true)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  return (
    <Dialog
      open={props.open}
      close={{label: 'Cancel', action: () => props.close(false)}}
      title="Revoke"
      loading={loading}
      actions={[{label: 'Revoke', action: revoke, color: 'primary'}]}
    >
      <Typography>
        Are you sure you want to revoke the user statement for key
        {props.kid}?
      </Typography>
    </Dialog>
  )
}
