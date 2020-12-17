import * as React from 'react'

import {Box} from '@material-ui/core'
import Link from '../../components/link'

import AuthUnlockPasswordView from './password'
import AuthUnlockFIDO2View from './fido2'
import AuthForgotView from './forgot'

import {store, loadStatus} from '../../store'
import {AuthType} from '@keys-pub/tsclient/lib/keys'
import {Action} from './actions'

type Props = {
  refresh: () => void
}

export default (props: Props) => {
  const [step, setStep] = React.useState('password')

  const fido2Enabled = store.useState((s) => s.fido2Enabled)

  React.useEffect(() => {
    loadStatus()
  }, [])

  let actions = [] as Action[]

  switch (step) {
    case 'password':
      actions = [{label: 'Forgot Password?', action: () => setStep('forgot')}]
      if (fido2Enabled) {
        actions.push({label: 'Use FIDO2', action: () => setStep('fido2')})
      }
      break
    case 'fido2':
      actions = [{label: 'Use Password', action: () => setStep('password')}]
      break
  }

  const closeForgot = async () => {
    setStep('password')
    await props.refresh()
  }

  return (
    <Box display="flex" flex={1} flexDirection="column">
      {step == 'forgot' && <AuthForgotView close={closeForgot} />}
      {step == 'password' && <AuthUnlockPasswordView actions={actions} />}
      {step == 'fido2' && <AuthUnlockFIDO2View actions={actions} />}
    </Box>
  )
}
