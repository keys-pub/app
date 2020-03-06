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

exports.default = async function fixArtifacts(buildResult) {
  await fix()
}
