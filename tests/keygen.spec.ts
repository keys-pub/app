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
  it('generates a key', async () => {
    await app.client.waitUntilWindowLoaded()
    const count = await app.client.getWindowCount()
    expect(count).toEqual(1)

    // Unlock
    const unlockPasswordInput = await app.client.$('#unlockPasswordInput')
    await unlockPasswordInput.setValue('testpassword')
    const unlockButton = await app.client.$('#unlockButton')
    await unlockButton.click()

    await app.client.$('#keysView')

    // // Intro prompt for new key
    // await app.client.$('#keyGenerateDialog')
    // const keyGenerateCloseButton = await app.client.$('#keyGenerateCloseButton')
    // await keyGenerateCloseButton.click()

    // Generate new key
    const newKeyButton = await app.client.$('#newKeyButton')
    await newKeyButton.click()

    const keyGenerateButton = await app.client.$('#keyGenerateButton')
    await keyGenerateButton.click()

    // Created (next)
    const keyCreatedNextButton = await app.client.$('#keyCreatedNextButton')
    await keyCreatedNextButton.click()

    // Select echo
    const userServiceSelect = await app.client.$('#userServiceSelect')
    await userServiceSelect.click()
    await app.client.keys('ArrowDown')
    await app.client.keys('ArrowDown')
    await app.client.keys('ArrowDown')
    await app.client.keys('ArrowDown')
    await app.client.keys('Enter')

    const keyUserLinkButton = await app.client.$('#keyUserLinkButton')
    await keyUserLinkButton.click()

    // Enter echo name
    const userNameTextField = await app.client.$('#userNameTextField')
    await userNameTextField.setValue('testuser')

    const userSignButton = await app.client.$('#userSignButton')
    await userSignButton.click()

    // Save echo user
    const userAddButton = await app.client.$('#userAddButton')
    await userAddButton.click()
  })
})
