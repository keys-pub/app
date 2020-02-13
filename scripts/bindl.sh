#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

ver=`yarn run -s version`
tag=v$ver

echo "Package version: $ver"
echo "Tag: $tag"

if [[ ! $tag == v* ]]; then
  echo "Version should start with v"
  exit 1
fi

file=keys_${ver}_darwin_x86_64.tar.gz

cd bin
wget https://github.com/keys-pub/keysd/releases/download/${tag}/$file
tar zxpvf $file
rm $file
cd ..