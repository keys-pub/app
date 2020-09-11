# How to Release

- Release the service at keys-pub/keys-ext.
- Update package.json version.
- Test updater: `VERSION=0.0.0 KEYS_BIN=~/go/bin/keys UPDATER_BIN=~/go/bin/updater UPDATER_APPLY=/Applications/Keys.app yarn start-prod` to ensure this version is updateable. (On Windows, `VERSION=0.0.0 KEYS_BIN=~/go/bin/keys.exe UPDATER_BIN=~/go/bin/updater.exe yarn start-prod`)
- Create branch with version v1.2.3, the github action will build the apps.
- Save app release as prerelease (from draft).

## Prerelease to Release

- Update website with new version and deploy. Check links from home page.
- Edit release and uncheck prerelease (same with keys-pub/keys-ext).
- Run `./scripts/release-pkgs.sh` for brew, cask, scoop.
- Run `./scripts/aptly.sh` in keys-ext for apt.
