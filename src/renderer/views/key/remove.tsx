import * as React from 'react'

import {Box, Button, Typography} from '@material-ui/core'

import {styles} from '../../components'
import Dialog from '../../components/dialog'
import Snack, {SnackProps} from '../../components/snack'

import {keyRemove} from '../../rpc/keys'
import {Key, KeyType, KeyRemoveRequest, KeyRemoveResponse} from '../../rpc/keys.d'

type Props = {
  open?: boolean
  k: Key
  close: (removed: boolean) => void
}

export default (props: Props) => {
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const removeKey = async () => {
    try {
      const req: KeyRemoveRequest = {kid: props.k.id}
      const resp = await keyRemove(req)
      props.close(true)
    } catch (err) {
      setSnack({message: err.message, alert: 'error', duration: 4000})
      setSnackOpen(true)
    }
  }

  const key = props.k
  const open = props.open
  const isPrivate = key.type == KeyType.X25519 || key.type == KeyType.EDX25519

  return (
    <Dialog
      open={!!open}
      close={{label: 'Cancel', action: () => props.close(false)}}
      title="Delete Key"
      actions={[{label: 'Delete', action: removeKey, color: 'secondary'}]}
    >
      {isPrivate ? <PrivateKey kid={props.k.id} /> : <PublicKey kid={props.k.id} />}
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Dialog>
  )
}

const PrivateKey = (props: {kid?: string}) => {
  return (
    <Box>
      <Typography style={{paddingBottom: 10}}>
        Are you really sure you want to delete this <span style={{fontWeight: 600}}>private</span> key?
      </Typography>
      <Typography style={{...styles.mono, paddingBottom: 10, fontWeight: 600}}>{props.kid}</Typography>
      <Typography>
        <span style={{fontWeight: 600}}>
          If you haven't backed up the key, you won't be able to recover it.
        </span>
      </Typography>
    </Box>
  )
}

const PublicKey = (props: {kid?: string}) => {
  return (
    <Box>
      <Typography style={{paddingBottom: 10}}>Do you want to delete this public key?</Typography>
      <Typography style={{...styles.mono}}>{props.kid}</Typography>
    </Box>
  )
}
