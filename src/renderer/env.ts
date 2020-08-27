import * as os from 'os'

export const platform = (): NodeJS.Platform => {
  let platform = os.platform()
  if (process.env.KEYS_PLATFORM) {
    platform = process.env.KEYS_PLATFORM as NodeJS.Platform
  }
  return platform
}
