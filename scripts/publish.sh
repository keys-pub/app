#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

ver=`yarn run -s version`

hub release create -d \
-a release/Keys-${ver}.dmg \
-a release/Keys-${ver}-mac.zip \
-a release/latest-mac.yml \
-m "${ver}" \
v${ver}
 