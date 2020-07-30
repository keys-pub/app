#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/..

tag=$1

if [ "$tag" = "" ]; then
    echo "Specify version (tag)"
    exit 1
fi

if [[ -d release ]]; then
    rm -rf release
fi

yarn install
ver=`yarn run -s version`

if [ ! "$tag" = "v$ver" ]; then
    echo "Version doesn't match package version $tag != v$ver"
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

echo "Release finished, see https://github.com/keys-pub/app/releases"