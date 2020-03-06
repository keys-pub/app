#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

ver=`yarn run -s version`

zip=Keys-${ver}-mac.zip
dmg=Keys-${ver}.dmg

cat release/latest-mac.yml

echo "Re-building latest-mac.yml"
./node_modules/app-builder-bin/mac/app-builder blockmap -i release/$zip -o /tmp/tmp.zip > /tmp/bm-zip.json

zip_sha512=`cat /tmp/bm-zip.json | jq -r ".sha512"`
zip_size=`cat /tmp/bm-zip.json | jq -r ".size"`
zip_blockMapSize=`cat /tmp/bm-zip.json | jq -r ".blockMapSize"`

dmg_sha512=`shasum -a 512 release/$dmg | cut -f 1 -d ' ' | xxd -r -p | base64`
dmg_size=`wc -c < release/$dmg`
isodate=`date -u +"%Y-%m-%dT%H:%M:%SZ"`

echo "version: ${ver}
files:
  - url: ${zip}
    sha512: ${zip_sha512}
    size: ${zip_size}
    blockMapSize: ${zip_blockMapSize}
  - url: ${dmg}
    sha512: ${dmg_sha512}
    size: ${dmg_size}
path: ${zip}
sha512: ${zip_sha512}
releaseDate: '${isodate}'" > release/latest-mac.yml

echo "After:"
cat release/latest-mac.yml