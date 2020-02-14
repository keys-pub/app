# keys.pub

[![GoDoc](https://godoc.org/github.com/keys-pub/keys?status.svg)](https://godoc.org/github.com/keys-pub/keys)

☢ This project is in development and has not been audited or reviewed. Use at your own risk. ☢

## Documentation

Visit **[keys.pub](https://docs.keys.pub)**.

## Repositories

|                                                                |                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [github.com/keys-pub/keys](https://github.com/keys-pub/keys)   | Cryptographic key management, signing and encryption, including [keys/saltpack](https://godoc.org/github.com/keys-pub/keys/saltpack) and [keys/keyring](https://godoc.org/github.com/keys-pub/keys/keyring). |
| [github.com/keys-pub/keysd](https://github.com/keys-pub/keysd) | Service (gRPC), command line client, DB, Firestore, REST API, etc.                                                                                                                                           |
| [github.com/keys-pub/app](https://github.com/keys-pub/app)     | Desktop app (in development).                                                                                                                                                                                |

## Development

### Install

```shell
yarn install
```

If after updating, you see an error that suggests you `npm rebuild`, you should run:

```bash
yarn rebuild
```

### Run

```shell
yarn start-dev
```

### Running Another Instance

To run a second instance that connects to different service:

```console
PORT=4343 KEYS_PORT=10002 KEYS_APP=Keys2 yarn start-dev

# Run a service on that port and app
keysd -port=10002 -app=Keys2
```

### Debugging Prod Builds

```shell
DEBUG_PROD=true yarn build && NODE_ENV=production ./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron ./src/main/main.prod.js
```

### Toggle Chrome DevTools

- macOS: `Cmd-Alt-I` or `F12`
- Linux: `Ctrl-Shift-I` or `F12`
- Windows: `Ctrl-Shift-I` or `F12`

_See [electron-debug](https://github.com/sindresorhus/electron-debug) for more information._

For better formatting of immutable objects in console:

- In Dev Tools, press F1 to load the Settings. Scroll down to the Console section and tick "Enable custom formatters".

## Release

```shell
# update package.json version v0.0.x
hub create release v0.0.x -m v0.0.x
./scripts/release.sh
```

## TODO

- Investigate sandboxing Electron app can only communicate with service
