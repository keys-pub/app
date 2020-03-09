#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

uname=`uname`
echo "Uname: $uname"

if [[ $uname = "Darwin" ]]; then
    platform="darwin"
elif [[ $uname = MINGW64_NT* ]]; then
    platform="windows"
else
    echo "Unknown platform"
    exit 1
fi

# keysd
ver=`yarn run -s version`
echo "Package version: $ver"
file=keys_${ver}_${platform}_x86_64.tar.gz

cd bin
wget https://github.com/keys-pub/keysd/releases/download/v${ver}/${file}
tar zxpvf ${file}
rm ${file}
rm LICENSE
rm README.md
cd ..


# updater
updater_ver=0.1.2
updater_file=updater_${updater_ver}_${platform}_x86_64.tar.gz

cd bin
wget https://github.com/keys-pub/updater/releases/download/v${updater_ver}/${updater_file}
tar zxpvf ${updater_file}
rm ${updater_file}
rm LICENSE
rm README.md
cd ..