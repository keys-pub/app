#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

dotenv="$dir/../.env"

tmpdir="$dir/tmp"
if [ -d $tmpdir ]; then
  echo "$tmpdir already exists"
  exit 1
fi
# function finish {
#   rm -rf "$tmpdir"
# }
# trap finish EXIT
mkdir -p "$tmpdir"

echo "$tmpdir"
cd "$tmpdir"
git clone https://github.com/keys-pub/app
cd app

cp "$dotenv" .env

ver=`yarn run -s version`
tag=v$ver

echo "Package version: $ver"
echo "Tag: $tag"

if [[ ! $tag == v* ]]; then
  echo "Version should start with v"
  exit 1
fi

hub release create $tag -m $tag

./scripts/bindl.sh

yarn install
yarn dist

hub release edit $tag -m $tag -a release/Keys-$ver.dmg
