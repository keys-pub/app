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
yarn start-dev
```

You can start using a different app name, which is convienient for running multiple instances of the app.

```shell
# Start app for Keys2
KEYS_APP=Keys2 KEYS_PORT=22406 DEV_PORT=2004 yarn start-dev

# Set port for Keys2
keys -app Keys2 config set port 22406

# Start keysd for Keys2
keysd -app Keys2
```
