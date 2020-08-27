import {app, setEnv, sleep} from './app'

jest.setTimeout(20000)

describe('App', () => {
  beforeEach(() => {
    setEnv(11)
    return app.start()
  })
  afterEach(async () => {
    if (app.isRunning()) {
      return app.stop()
    }
  })
  it('encrypts', async () => {
    await app.client.waitUntilWindowLoaded()
    const count = await app.client.getWindowCount()
    expect(count).toEqual(1)

    // Unlock
    const unlockPasswordInput = await app.client.$('#unlockPasswordInput')
    await unlockPasswordInput.setValue('testpassword')
    const unlockButton = await app.client.$('#unlockButton')
    await unlockButton.click()

    await app.client.$('#keysView')

    // Tools
    const navToolsItemIcon = await app.client.$('#navToolsItemIcon')
    await navToolsItemIcon.click()

    // Recipients
    const encryptRecipientsAutocomplete = await app.client.$('#encryptRecipientsAutocomplete')
    await encryptRecipientsAutocomplete.click()

    // TODO: Finish
  })
})
