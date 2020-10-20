import * as React from 'react'

import {Box, Button, Divider, FormControl, FormHelperText, TextField, Typography} from '@material-ui/core'
import {Link} from '../../components'
import Dialog from '../../components/dialog'

import {keys} from '../../rpc/client'
import {AuthType, Encoding} from '@keys-pub/tsclient/lib/keys'
import {openSnackError, closeSnack} from '../../snack'

type Props = {
  open: boolean
  close: (snack?: string) => void
}

export default (props: Props) => {
  const [paperKey, setPaperKey] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const init = async () => {
      try {
        const resp = await keys.Rand({numBytes: 32, encoding: Encoding.BIP39})
        setPaperKey(resp.data || '')
      } catch (err) {
        openSnackError(err)
      }
    }
    init()
  }, [])

  const onAuthProvision = async () => {
    setLoading(true)
    closeSnack()
    try {
      const resp = await keys.AuthProvision({
        secret: paperKey,
        type: AuthType.PAPER_KEY_AUTH,
      })
      setPaperKey('')
      setLoading(false)
      props.close('Paper key saved')
    } catch (err) {
      setLoading(false)
      openSnackError(err)
    }
  }

  return (
    <Dialog
      open={props.open}
      title="Paper Key"
      close={{label: 'Close', action: () => props.close()}}
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
    </Dialog>
  )
}
