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
# --verbose \

file=release/Keys-$ver.dmg

uuid=`xcrun altool --notarize-app --primary-bundle-id "pub.Keys" --username "gabrielh@gmail.com" --password "@keychain:AC_PASSWORD" --file $file 2>&1 | grep 'RequestUUID' | awk '{ print $3 }'` 

echo "Successfully uploaded to notarization service, polling for result: $uuid"
sleep 15
while :
    do
    fullstatus=`xcrun altool --notarization-info "$uuid" --username "gabrielh@gmail.com" --password "@keychain:AC_PASSWORD" 2>&1`
    status=`echo "$fullstatus" | grep 'Status\:' | awk '{ print $2 }'`
    if [ "$status" = "success" ]; then
        echo "Notarization success"
        xcrun stapler staple "$file"
        return
    elif [ "$status" = "in" ]; then
        echo "Notarization still in progress, sleeping for 15 seconds and trying again"
        sleep 15
    else
        echo "Notarization failed fullstatus below"
        echo "$fullstatus"
        exit 1
    fi
done
