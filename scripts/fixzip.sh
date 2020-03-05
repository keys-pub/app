#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

ver=`yarn run -s version`

zip=Keys-${ver}-mac.zip

# electron-builder zip has problems
# https://github.com/electron-userland/electron-builder/issues/4299

echo "Fixing $zip"

cd release
if [[ -f $zip ]]; then
    rm $zip
fi

cd mac
ditto -c -k --sequesterRsrc --keepParent Keys.app $zip
mv $zip ..
