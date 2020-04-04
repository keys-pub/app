#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

ver=`yarn run -s version`
sh scripts/release-tool.sh

release download-extra -version $ver -out bin