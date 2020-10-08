import * as React from 'react'

import {Box} from '@material-ui/core'
import {Link} from '../../components'

import AuthUnlockPasswordView from './password'
import AuthUnlockFIDO2View from './fido2'
import AuthForgotView from './forgot'

import {store, unlocked, loadStatus} from '../../store'
import {authUnlock} from '../../rpc/keys'
import {AuthType} from '../../rpc/keys.d'
import {Action} from './actions'

type Props = {}

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

  return (
    <Box display="flex" flex={1} flexDirection="column">
      {step == 'forgot' && <AuthForgotView close={() => setStep('password')} />}
      {step == 'password' && <AuthUnlockPasswordView actions={actions} />}
      {step == 'fido2' && <AuthUnlockFIDO2View actions={actions} />}
    </Box>
  )
}
