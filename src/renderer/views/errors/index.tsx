import * as React from 'react'

import {store} from '../store'
import ErrorDialog from './dialog'

export default (_: {}) => {
  const {error} = store.useState((s) => ({
    error: s.error,
  }))

  // const clear = () => {
  //   store.update((s) => {
  //     s.error = undefined
  //   })
  // }

  if (!error) return null
  return <ErrorDialog error={error} />
}
