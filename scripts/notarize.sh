#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $dir/../release

ver=$1

if [ "$ver" = "" ]; then
    echo "No version specified"
    exit 1
fi

# xcrun altool --store-password-in-keychain-item "AC_PASSWORD" -u "gabrielh@gmail.com" -p "<password>"

# Try different transport in flakey environments e.g., --transport Aspera

xcrun altool --notarize-app \
    --verbose \
    --primary-bundle-id "pub.Keys" \
    --username "gabrielh@gmail.com" \
    --password "@keychain:AC_PASSWORD" \    
    --file Keys-$ver.dmg

# xcrun altool --notarization-history 0 -u "gabrielh@gmail.com" -p "@keychain:AC_PASSWORD"

xcrun stapler staple "Keys-0.0.23.dmg"

# ditto -x -k Keys-$ver-mac.zip .
# xcrun stapler staple "Keys.app"
# rm Keys-$ver-mac.zip
# ditto -ck --sequesterRsrc --keepParent Keys.app Keys-$ver-mac.zip
# rm -rf Keys.app