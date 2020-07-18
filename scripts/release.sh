#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

ver=$1

if [ "$ver" = "" ]; then
    echo "Specify version"
    exit 1
fi

if [[ -d release ]]; then
    rm -rf release
fi

yarn install
yarn_ver=`yarn run -s version`

if [ ! "$ver" = "$yarn_ver" ]; then
    echo "Version doesn't match package version"
    exit 1
fi

# Install release tool
./scripts/release-tool.sh
release_bin="$HOME/go/bin/release"

$release_bin download-extra -version $ver -out bin

yarn dist

# Notarize (using afterSign notarize.js)
# sh scripts/notarize.sh $ver    

$release_bin fix-build -version $ver -in release -out release
$release_bin latest-yaml -version $ver -in release -out release
$release_bin publish -version $ver -in release
$release_bin cask -version $ver

echo "Release finished, see https://github.com/keys-pub/app/releases"