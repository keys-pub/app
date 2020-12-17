import {store} from './store'
import {SnackProps} from './components/snack'
import {Error} from './store'

export const openSnack = (snack: SnackProps) => {
  store.update((s) => {
    s.snackOpen = true
    s.snack = snack
  })
}

export const closeSnack = () => {
  store.update((s) => {
    s.snackOpen = false
  })
}

export const openSnackError = (err: Error) => {
  let message = err.message
  if (err.details) {
    message = err.details
  }
  openSnack({message: message, alert: 'error', duration: 8000})
}
