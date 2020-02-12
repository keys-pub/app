#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Checkout to tmpdir
tmpdir=`mktemp -d 2>/dev/null || mktemp -d -t 'mytmpdir'`
echo "$tmpdir"
cd "$tmpdir"
git clone https://github.com/keys-pub/app
cd app

tag=`git describe --abbrev=0 --tags`

if [[ ! $tag == v* ]]; then
  echo "Version should start with v"
  exit 1
fi

ver=${tag:1}

pkgver=`yarn run -s version`

echo "Tag: $tag"
echo "Version: $ver"
echo "Package version: $pkgver"

if [ ! "$pkgver" = "$ver" ]; then
    echo "Package version doesn't match tag version $pkgver != $ver"
    exit 1
fi

file=keys_${ver}_darwin_x86_64.tar.gz

cd bin
wget https://github.com/keys-pub/keysd/releases/download/${tag}/$file
tar zxpvf $file
rm $file
cd ..

yarn install
yarn dist

hub release edit $tag -m $tag -a release/Keys-$ver.dmg -a release/Keys-$ver-mac.zip
