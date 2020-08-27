# How to Release

- Release the service at keys-pub/keys-ext.
- Update package.json version.
- Create branch with version v1.2.3, the github action will build the apps.
- Save app release as prerelease (from draft).
- Test updater with `VERSION=0.0.0 yarn start-prod` to ensure this version is updateable. (On both windows and macOS.)

## Prerelease to Release

- Update website with new version and deploy. Check links from home page.
- Edit release and uncheck prerelease (same with keys-pub/keys-ext).
- Run `./scripts/release-pkgs.sh` for brew, cask, scoop.
