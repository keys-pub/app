const {exec} = require('child_process')

exports.default = function fixArtifacts(buildResult) {
  console.log('Build result:', buildResult)
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
      resolve([])
    })
  })
}
