import {store} from './store'
import {SnackProps} from './components/snack'

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
  openSnack({message: err.message, alert: 'error', duration: 6000})
}
