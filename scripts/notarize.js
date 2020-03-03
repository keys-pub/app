require('dotenv').config()
const {notarize} = require('electron-notarize')
const {exec} = require('child_process')

function fix() {
  return new Promise((resolve, reject) => {
    console.log('Fixing build...')
    exec('./scripts/fix.sh', (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      if (stderr) {
        reject(new Error(stderr))
        return
      }

      console.log(`${stdout}`)
      resolve()
    })
  })
}

exports.default = async function notarizing(context) {
  const {electronPlatformName, appOutDir} = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  await fix()

  console.log('Notarizing...')
  const appName = context.packager.appInfo.productFilename

  // In .env, put APPLEID=...
  const appleId = process.env.APPLEID
  // security add-generic-password -a "<appleid>" -w <app_specific_password> -s "AC_PASSWORD"
  const password = `@keychain:AC_PASSWORD`

  return await notarize({
    appBundleId: 'pub.Keys',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: password,
  })
}
