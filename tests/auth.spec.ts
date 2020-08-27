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
  it('auth', async () => {
    await app.client.waitUntilWindowLoaded()
    const count = await app.client.getWindowCount()
    expect(count).toEqual(1)

    const setupPasswordInput = await app.client.$('#setupPasswordInput')
    await setupPasswordInput.setValue('testpassword')
    const setupPasswordConfirmInput = await app.client.$('#setupPasswordConfirmInput')
    await setupPasswordConfirmInput.setValue('testpassword')
    const setupPasswordButton = await app.client.$('#setupPasswordButton')
    await setupPasswordButton.click()

    // Intro prompt for new key
    await app.client.$('#keyGenerateDialog')
    const keyGenerateCloseButton = await app.client.$('#keyGenerateCloseButton')
    await keyGenerateCloseButton.click()

    // Lock
    const lockButton = await app.client.$('#lockButton')
    await lockButton.click()

    // Unlock
    const unlockPasswordInput = await app.client.$('#unlockPasswordInput')
    await unlockPasswordInput.setValue('testpassword')
    const unlockButton = await app.client.$('#unlockButton')
    await unlockButton.click()

    await app.client.$('#keysView')
  })
})
