import * as React from 'react'

import * as path from 'path'

import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Box,
} from '@material-ui/core'

import {AddRecipientIcon, SignIcon, CopyIcon} from '../icons'

import {Link} from '../components'

import AutocompletesView from '../keys/autocompletes'
import SignKeySelectView from '../keys/select'

import {clipboard, shell, ipcRenderer, OpenDialogReturnValue} from 'electron'
import * as grpc from '@grpc/grpc-js'
import {store, loadStore} from './store'
import {closeSnack, openSnack, openSnackError} from '../snack'
import {contentTop, column2Color} from '../theme'

import {configSet, configGet, keys, encrypt, encryptFile, EncryptFileEvent} from '../rpc/keys'
import {
  Key,
  Config,
  EncryptMode,
  EncryptOptions,
  EncryptRequest,
  EncryptResponse,
  EncryptFileInput,
  EncryptFileOutput,
} from '../rpc/keys.d'

const openFile = async () => {
  clear(true)
  const open: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {})
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const file = open.filePaths[0]
    store.update((s) => {
      s.fileIn = file || ''
    })
  }
}

const clear = (outOnly: boolean) => {
  closeSnack()
  if (outOnly) {
    store.update((s) => {
      s.output = ''
      s.fileOut = ''
    })
  } else {
    store.update((s) => {
      s.input = ''
      s.output = ''
      s.fileIn = ''
      s.fileOut = ''
      s.loading = false
    })
  }
}

const copyToClipboard = (value: string) => {
  clipboard.writeText(value)
  openSnack({message: 'Copied to Clipboard', duration: 2000})
}

const openFolder = (value: string) => {
  shell.showItemInFolder(value)
}

const encryptFileIn = (
  dir: string,
  fileIn: string,
  recipients: Key[],
  sender: Key | undefined,
  noSenderRecipient: boolean,
  noSign: boolean
) => {
  clear(true)
  if (fileIn == '' || recipients.length == 0) {
    return
  }

  const baseOut = path.basename(fileIn)
  const fileOut = path.join(dir, baseOut + '.enc')

  const recs = recipients.map((k: Key) => k.id!)
  const req: EncryptFileInput = {
    in: fileIn,
    out: fileOut,
    recipients: recs,
    sender: sender?.id,
    options: {
      armored: false,
      noSenderRecipient,
      noSign,
    },
  }

  console.log('Encrypting file...')
  store.update((s) => {
    s.loading = true
  })
  const send = encryptFile((event: EncryptFileEvent) => {
    console.log('Encrypt file:', event)
    const {err, res, done} = event
    if (err) {
      if (err.code == grpc.status.CANCELLED) {
        store.update((s) => {
          s.loading = false
        })
      } else {
        store.update((s) => {
          s.loading = false
        })
        openSnackError(err)
      }
      return
    }
    if (res) {
      store.update((s) => {
        s.output = ''
        s.fileOut = res.out || ''
      })
    }
    if (done) {
      store.update((s) => {
        s.loading = false
      })
    }
  })
  send(req, false)
}

const encryptInput = async (
  input: string,
  recipients: Key[],
  sender: Key | undefined,
  noSenderRecipient: boolean,
  noSign: boolean
) => {
  if (!input || recipients.length == 0) {
    clear(true)
    return
  }

  if (noSenderRecipient && noSign) {
    sender = undefined
  }

  const recs = recipients.map((k: Key) => k.id!)

  console.log('Encrypting...')
  try {
    const data = new TextEncoder().encode(input)
    const req: EncryptRequest = {
      data: data,
      recipients: recs,
      sender: sender?.id,
      options: {armored: true, noSenderRecipient, noSign},
    }
    const resp = await encrypt(req)
    const encrypted = new TextDecoder().decode(resp.data)
    store.update((s) => {
      s.output = encrypted
      s.fileOut = ''
    })
  } catch (err) {
    openSnackError(err)
  }
}

const encryptFileTo = async (
  fileIn: string,
  recipients: Key[],
  sender: Key | undefined,
  noSenderRecipient: boolean,
  noSign: boolean
) => {
  const open: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
    properties: ['openDirectory'],
  })
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const dir = open.filePaths[0]
    encryptFileIn(dir, fileIn, recipients, sender, noSenderRecipient, noSign)
  }
}

const createReaction = (): (() => void) => {
  return store.createReaction(
    (s) => ({
      recipients: s.recipients,
      sender: s.sender,
      noSenderRecipient: s.noSenderRecipient,
      noSign: s.noSign,
    }),
    (s) => {
      const recs = s.recipients.map((k: Key) => k.id!)
      const config: Config = {
        encrypt: {
          recipients: recs,
          sender: s.sender?.id,
          noSenderRecipient: s.noSenderRecipient,
          noSign: s.noSign,
        },
      }
      const set = async () => await configSet({name: 'encrypt', config})
      set()
    }
  )
}

type Props = {}

export default (props: Props) => {
  const {
    fileIn,
    fileOut,
    input,
    loading,
    noSenderRecipient,
    noSign,
    output,
    recipients,
    sender,
  } = store.useState()

  const inputRef = React.useRef<HTMLTextAreaElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  React.useEffect(() => {
    if (fileIn == '') {
      encryptInput(input, recipients, sender, noSenderRecipient, noSign)
    } else if (fileOut != '') {
      store.update((s) => {
        s.fileOut = ''
      })
    }
  }, [input, recipients, sender, noSenderRecipient, noSign])

  React.useEffect(() => {
    loadStore()
    return createReaction()
  }, [])

  let senderSelect = sender
  let senderLabel = 'Signed by'
  if (noSign && noSenderRecipient) {
    senderSelect = undefined
    senderLabel = ''
  } else if (noSign) {
    senderLabel = 'Including'
  }

  const left = 10

  const canEncryptFile = fileIn && recipients.length > 0
  const showEncryptFileButton = canEncryptFile && fileIn && !fileOut
  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Box style={{marginLeft: left, marginTop: contentTop, marginBottom: 8}}>
        <Typography variant="h4">Encrypt</Typography>
      </Box>
      <Box style={{paddingLeft: left, paddingRight: 8}}>
        <AutocompletesView
          keys={recipients}
          disabled={loading}
          onChange={(recipients: Key[]) =>
            store.update((s) => {
              s.recipients = recipients
            })
          }
          id="encryptRecipientsAutocomplete"
          placeholder="Recipients"
          searchOption
          importOption
        />
      </Box>
      <Box display="flex" style={{position: 'relative'}}>
        <Box display="flex" flex={1} flexDirection="row">
          <SignKeySelectView
            value={senderSelect}
            onChange={(sender?: Key) => {
              store.update((s) => {
                s.sender = sender
                if (noSign && noSenderRecipient) {
                  s.noSign = false
                  s.noSenderRecipient = false
                }
              })
            }}
            label={senderLabel}
            disabled={loading}
            placeholder="Anonymous"
            SelectDisplayProps={{
              style: {
                paddingLeft: left,
              },
            }}
          />

          <Box style={{position: 'absolute', right: 0, top: -5}}>
            <IconButton
              color={!noSenderRecipient ? 'primary' : 'inherit'}
              style={{}}
              onClick={() =>
                store.update((s) => {
                  s.noSenderRecipient = !noSenderRecipient
                })
              }
              disabled={!sender || loading}
            >
              <Tooltip title="Include as Recipient">
                <AddRecipientIcon style={{color: !noSenderRecipient ? '' : '#999'}} />
              </Tooltip>
            </IconButton>

            <IconButton
              color={!noSign ? 'primary' : 'inherit'}
              style={{}}
              onClick={() =>
                store.update((s) => {
                  s.noSign = !noSign
                })
              }
              disabled={!sender || loading}
            >
              <Tooltip title="Sign">
                <SignIcon style={{color: !noSign ? '' : '#999'}} />
              </Tooltip>
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
        <Box style={{width: '100%', height: 1, backgroundColor: '#eee'}} />
        <Box style={{position: 'absolute', top: 0, width: '100%'}}>{loading && <LinearProgress />}</Box>
        {fileIn && (
          <Box display="flex" flexDirection="column" style={{paddingTop: 8, paddingLeft: left}}>
            <Box>
              <Typography variant="body2" style={{display: 'inline'}}>
                {fileIn}&nbsp;
              </Typography>
              <Link inline onClick={() => clear(false)} disabled={loading}>
                Clear
              </Link>
            </Box>
            {showEncryptFileButton && (
              <Box marginTop={1}>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  onClick={() => encryptFileTo(fileIn, recipients, sender, noSenderRecipient, noSign)}
                  disabled={loading}
                >
                  Encrypt to
                </Button>
              </Box>
            )}
          </Box>
        )}
        {!fileIn && (
          <Box style={{height: '100%'}}>
            <textarea
              autoFocus
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={onInputChange}
              spellCheck="false"
              style={{
                height: 'calc(100% - 16px)',
                width: 'calc(100% - ' + left + 'px)',
                overflowY: 'auto',
                border: 'none',
                color: 'rgba(0, 0, 0, 0.87)',
                fontSize: '0.857rem',
                fontFamily: 'Open Sans',
                fontWeight: 400,
                outline: 0,
                resize: 'none',
                paddingRight: 0,
                paddingTop: 8,
                paddingLeft: left,
                paddingBottom: 8,
                backgroundColor: 'white',
              }}
            />
            {!input && (
              <Box style={{position: 'absolute', top: 9, left: left}}>
                <Typography
                  style={{display: 'inline', color: '#a2a2a2'}}
                  onClick={() => inputRef.current?.focus()}
                >
                  Type text to encrypt or{' '}
                </Typography>
                <Link inline onClick={openFile}>
                  select a file
                </Link>
                <Typography style={{display: 'inline'}}>.</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
      <Box display="flex" flexDirection="column" flex={1} style={{position: 'relative'}}>
        {output && (
          <Box style={{position: 'absolute', right: 16, top: 4, zIndex: 10}}>
            <IconButton
              onClick={() => copyToClipboard(output)}
              size="small"
              style={{padding: 4, backgroundColor: 'white'}}
            >
              <CopyIcon />
            </IconButton>
          </Box>
        )}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            overflowY: 'auto',
            padding: 12,
            // borderRadius: 10,
            backgroundColor: column2Color,
          }}
        >
          {output && <Typography variant="body2">{output}</Typography>}

          {fileOut && (
            <Box display="flex" flex={1}>
              <Typography variant="body2" style={{display: 'inline'}}>
                {fileOut}&nbsp;
              </Typography>
              <Link inline onClick={() => openFolder(fileOut)}>
                Open Folder
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
