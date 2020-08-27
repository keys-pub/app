#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir

ver=${1:-""}

if [ "$ver" = "" ]; then 
  echo "Specify version to release, x.y.z"
  exit 1
fi

if [[ $ver == v* ]]; then
  echo "Version should be x.y.z"
  exit 1
fi

# Install release tool
./release-tool.sh
release_bin="$HOME/go/bin/release"

$release_bin brew -version $ver
$release_bin cask -version $ver
$release_bin scoop -version $ver

