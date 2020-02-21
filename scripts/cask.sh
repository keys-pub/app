#!/usr/bin/env bash

set -e -u -o pipefail # Fail on error

dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
tmpdir="$dir/tmp.cask"
rm -rf "$tmpdir"
mkdir -p "$tmpdir"
cd "$tmpdir"

ver=`yarn run -s version`

url="https://github.com/keys-pub/app/releases/download/v${ver}/Keys-${ver}-mac.zip"
wget $url

sha256=`shasum -a 256 Keys-${ver}-mac.zip | cut -f 1 -d ' '`

echo "cask 'keys' do
    version '${ver}'
    sha256 '${sha256}'
  
    url \"https://github.com/keys-pub/app/releases/download/v#{version}/Keys-#{version}-mac.zip\"
    appcast 'https://github.com/keys-pub/app/releases.atom'
    name 'Keys'
    homepage 'https://keys.pub'

    auto_updates true
    depends_on macos: '>= :sierra'
  
    app 'Keys.app'

    uninstall delete: [
        '/usr/local/bin/keys'
    ]

    zap trash: [
        '~/Library/Application Support/Keys',
        '~/Library/Caches/Keys',
        '~/Library/Logs/Keys',
        '~/Library/Preferences/pub.Keys.plist',
    ]
end" > keys.rb

cp keys.rb ../../../homebrew-tap/Casks