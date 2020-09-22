import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'
import {Link} from '../../../components'
import Dialog from '../../../components/dialog'
import Snack, {SnackProps} from '../../../components/snack'

import {authProvision, rand} from '../../../rpc/keys'
import {AuthType, Encoding} from '../../../rpc/keys.d'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [paperKey, setPaperKey] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [snackOpen, setSnackOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const openSnack = (snack: SnackProps) => {
    setSnack(snack)
    setSnackOpen(true)
  }

  React.useEffect(() => {
    const init = async () => {
      try {
        const resp = await rand({numBytes: 32, encoding: Encoding.BIP39})
        setPaperKey(resp.data || '')
      } catch (err) {
        openSnack({message: err.message, duration: 6000, alert: 'error'})
      }
    }
    init()
  }, [])

  const onAuthProvision = async () => {
    setLoading(true)
    try {
      const resp = await authProvision({
        secret: paperKey,
        type: AuthType.PAPER_KEY_AUTH,
      })
      setLoading(false)
      props.close('Paper key saved.')
    } catch (err) {
      setLoading(false)
      openSnack({message: err.message, duration: 6000, alert: 'error'})
    }
  }

  return (
    <Dialog
      open={props.open}
      title="Paper Key"
      close={{label: 'Cancel', color: 'secondary', action: () => props.close()}}
      actions={[{label: 'Provision', color: 'primary', action: () => onAuthProvision()}]}
    >
      <Box display="flex" flex={1} flexDirection="column" alignItems="center" style={{width: '100%'}}>
        <Typography
          variant="body2"
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            width: '100%',
            height: '100%',
          }}
        >
          {paperKey}
        </Typography>
      </Box>
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Dialog>
  )
}
