import * as React from 'react'

import {createHashHistory, Update, Transition} from 'history'

type DispatchHook = (to: string) => void
type LocationHook = [string, DispatchHook]

let history = createHashHistory()

const useHashLocation = (to: string): LocationHook => {
  const [location, setLocation] = React.useState(history.location.pathname)

  React.useEffect(() => {
    const handler = (update: Update) => {
      // console.log('Location:', update)
      setLocation(update.location.pathname)
    }
    const unlisten = history.listen(handler)
    return unlisten
  }, [])

  const navigate = React.useCallback((to) => {
    history.push(to)
  }, [])

  return [location, navigate]
}

export {history, useHashLocation}
