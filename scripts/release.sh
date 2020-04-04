#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

if [[ -d release ]]; then
    rm -rf release
fi
yarn dist

ver=`yarn run -s version`

sh scripts/release-tool.sh

release fix-build -version $ver -in release -out release
release latest-yaml -version $ver -in release -out release
release publish -version $ver -in release
release cask -version $ver
