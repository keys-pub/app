# keys.pub

☢ This project is in development and has not been audited or reviewed. Use at your own risk. ☢

## Documentation

Visit **[keys.pub](https://keys.pub)**.

## Repositories

| Repo                                                      | Description                                                                                                                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [keys-pub/keys](https://github.com/keys-pub/keys)         | Key management, signing and encryption, including [keys/saltpack](https://godoc.org/github.com/keys-pub/keys/saltpack) and [keys/keyring](https://godoc.org/github.com/keys-pub/keys/keyring). |
| [keys-pub/keys-ext](https://github.com/keys-pub/keys-ext) | Extensions: Service (gRPC), command line client, DB, Firestore, HTTP API/Client/Server, Vault, Wormhole, etc.                                                                                  |
| [keys-pub/app](https://github.com/keys-pub/app)           | Desktop app.                                                                                                                                                                                   |

## Development

### Install

```shell
yarn install
```

### Run

```shell
# Start keysd
keysd

# Start app
yarn server
yarn start
```

If you change anything in src/main, you'll need to restart (`yarn start`).
Anything changed in the renderer will be picked up automatically by `yarn server`, you rarely need to restart that.

You can run multiple instances by specifying a different app name and port:

```shell
# Start keysd (Keys2)
keysd -app Keys2 -port 22406

# Start app (Keys2)
yarn server
KEYS_APP=Keys2 KEYS_PORT=22406 yarn start
```
