require('dotenv').config()
const {notarize} = require('electron-notarize')

exports.default = async function notarizing(context) {
  const {electronPlatformName, appOutDir} = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  console.log('Notarizing...')
  const appName = context.packager.appInfo.productFilename

  // In .env, put APPLEID=...
  const appleId = process.env.APPLEID
  // security add-generic-password -a "<appleid>" -w <app_specific_password> -s "AC_PASSWORD"
  const password = process.env.AC_PASSWORD // `@keychain:AC_PASSWORD`

  return await notarize({
    appBundleId: 'pub.Keys',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: password,
    ascProvider: 'GabrielHandford190785325',
  })
}
