#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

# TODO: git pull & check dirty?

yarn install

if [[ -d release ]]; then
    rm -rf release
fi

# Install release tool
./scripts/release-tool.sh

ver=`yarn run -s version`
release download-extra -version $ver -out bin

yarn dist

# Notarize (using afterSign notarize.js)
# sh scripts/notarize.sh $ver    

release fix-build -version $ver -in release -out release
release latest-yaml -version $ver -in release -out release
release publish -version $ver -in release
release cask -version $ver

echo "Release finished, see https://github.com/keys-pub/app/releases"