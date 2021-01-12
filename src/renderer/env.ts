import * as os from 'os'

export const platform = (): NodeJS.Platform => {
  let platform = os.platform()
  if (process.env.KP_PLATFORM) {
    platform = process.env.KP_PLATFORM as NodeJS.Platform
  }
  return platform
}
