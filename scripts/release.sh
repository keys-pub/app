#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

if [[ -d release ]]; then
    rm -rf release
fi

# afterAllArtifactBuild, publish is not working in electron-builder
#yarn release

yarn dist
./scripts/publish.sh

echo "Release cask?"