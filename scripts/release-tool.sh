#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

rm -rf /tmp/release
cd /tmp
echo "Installing release tool..."
git clone --quiet https://github.com/keys-pub/release
cd release
go install .
