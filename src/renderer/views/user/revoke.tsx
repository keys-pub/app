import * as React from 'react'

import {Box, Button, DialogContentText, Divider, LinearProgress, Typography} from '@material-ui/core'
import Dialog from '../../components/dialog'
import Snack, {SnackProps} from '../../components/snack'

import {statementRevoke} from '../../rpc/keys'
import {StatementRevokeRequest, StatementRevokeResponse} from '../../rpc/keys.d'

type Props = {
  kid: string
  open: boolean
  seq: number
  close: (revoked: boolean) => void
}

export default (props: Props) => {
  const [loading, setLoading] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const revoke = async () => {
    setLoading(true)
    const req: StatementRevokeRequest = {
      kid: props.kid,
      seq: props.seq,
      local: false,
    }
    try {
      const resp = await statementRevoke(req)
      props.close(true)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setSnack({message: err.message, alert: 'error', duration: 4000})
      setSnackOpen(true)
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
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to revoke this user statement?
      </DialogContentText>
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Dialog>
  )
}
