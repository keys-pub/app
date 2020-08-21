const path = require('path')
const Application = require('spectron').Application

jest.setTimeout(20000)

const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
const sleep = (time: number) => new Promise((r) => setTimeout(r, time))

process.env.KEYS_APP = 'Keys11'
process.env.KEYS_PORT = '22211'
process.env.KEYS_BIN = path.join(process.env.HOME, 'go', 'bin', 'keys')
process.env.KEYS_STOP_ON_EXIT = '1'

const app = new Application({
  path: electronPath,
  args: [path.join(__dirname, '..', 'dist', 'main.js')],
})

describe('App', () => {
  beforeEach(() => {
    return app.start()
  })
  afterEach(() => {
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

    await app.client.$('#keyGenerateDialog')
    const keyGenerateCloseButton = await app.client.$('#keyGenerateCloseButton')
    await keyGenerateCloseButton.click()

    const lockButton = await app.client.$('#lockButton')
    await lockButton.click()

    const unlockPasswordInput = await app.client.$('#unlockPasswordInput')
    await unlockPasswordInput.setValue('testpassword')
    const unlockButton = await app.client.$('#unlockButton')
    await unlockButton.click()

    await app.client.$('#keysView')
  })
})
