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

import {PersonAdd as AddRecipientIcon, CreateOutlined as SignIcon} from '@material-ui/icons'

import {Link, styles} from '../../components'
import AutocompletesView from '../keys/autocompletes'
import EncryptedView from './encrypted'
import EncryptedFileView from './encryptedfile'
import SignKeySelectView from '../keys/select'

import {ipcRenderer, OpenDialogReturnValue} from 'electron'
import * as grpc from '@grpc/grpc-js'
import {Store} from 'pullstate'

import {configSet, configGet, keys, encrypt, encryptFile, EncryptFileEvent} from '../../rpc/keys'
import {
  Key,
  EncryptMode,
  EncryptOptions,
  EncryptRequest,
  EncryptResponse,
  EncryptFileInput,
  EncryptFileOutput,
} from '../../rpc/keys.d'

export type State = {
  addSenderRecipient: boolean
  error?: Error
  fileIn: string
  fileOut: string
  input: string
  loading: boolean
  output: string
  recipients: Key[]
  sender?: Key
  sign: boolean
}

const initialState: State = {
  addSenderRecipient: true,
  fileIn: '',
  fileOut: '',
  input: '',
  loading: false,
  output: '',
  recipients: [],
  sign: true,
}

const store = new Store(initialState)

const loadState = async () => {
  const configResp = await configGet({key: 'encrypt'})
  const config = configResp?.config?.encrypt

  const keysResp = await keys({})
  const recipients = (config?.recipients || [])
    .map((kid: string) => keysResp.keys?.find((k: Key) => k.id == kid))
    .filter((k?: Key) => k) as Key[]

  const sender = keysResp.keys?.find((k: Key) => k.id == config?.sender)

  store.update((s) => {
    s.recipients = recipients
    s.sender = sender
    s.sign = !config?.noSign
    s.addSenderRecipient = !config?.noSenderRecipient
  })
}
loadState()

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
  if (outOnly) {
    store.update((s) => {
      s.output = ''
      s.fileOut = ''
      s.error = undefined
    })
  } else {
    store.update((s) => {
      s.input = ''
      s.output = ''
      s.fileIn = ''
      s.fileOut = ''
      s.error = undefined
      s.loading = false
    })
  }
}

const encryptFileIn = (
  dir: string,
  fileIn: string,
  recipients: Key[],
  sender: Key | undefined,
  addSenderRecipient: boolean,
  sign: boolean
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
      noSenderRecipient: !addSenderRecipient,
      noSign: !sign,
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
          s.error = err
        })
      }
      return
    }
    if (res) {
      store.update((s) => {
        s.output = ''
        s.fileOut = res.out || ''
        s.error = undefined
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

const encryptFileTo = async (
  fileIn: string,
  recipients: Key[],
  sender: Key | undefined,
  addSenderRecipient: boolean,
  sign: boolean
) => {
  const open: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
    properties: ['openDirectory'],
  })
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const dir = open.filePaths[0]
    encryptFileIn(dir, fileIn, recipients, sender, addSenderRecipient, sign)
  }
}

const EncryptToButton = (props: {onClick: () => void; disabled: boolean}) => (
  <Box style={{marginLeft: 10, marginTop: 10}}>
    <Button color="primary" variant="outlined" disabled={props.disabled} onClick={props.onClick}>
      Encrypt to
    </Button>
  </Box>
)

type Props = {}

export default (props: Props) => {
  const inputRef = React.useRef<HTMLTextAreaElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {
    addSenderRecipient,
    error,
    fileIn,
    fileOut,
    input,
    loading,
    output,
    recipients,
    sender,
    sign,
  } = store.useState()

  React.useEffect(() => {
    const encryptInput = async () => {
      if (!input || recipients.length == 0) {
        clear(true)
        return
      }

      const recs = recipients.map((k: Key) => k.id!)

      console.log('Encrypting...')
      try {
        const data = new TextEncoder().encode(input)
        const req: EncryptRequest = {
          data: data,
          recipients: recs,
          sender: sender?.id,
          options: {armored: true, noSenderRecipient: !addSenderRecipient, noSign: !sign},
        }
        const resp = await encrypt(req)
        const encrypted = new TextDecoder().decode(resp.data)
        store.update((s) => {
          s.output = encrypted
          s.fileOut = ''
          s.error = undefined
        })
      } catch (err) {
        store.update((s) => {
          s.error = err
        })
      }
    }

    if (fileIn == '') {
      encryptInput()
    } else if (fileOut != '') {
      store.update((s) => {
        s.fileOut = ''
      })
    }
  }, [input, recipients, sender, addSenderRecipient, sign])

  React.useEffect(() => {
    return store.createReaction(
      (s) => ({
        recipients: s.recipients,
        sender: s.sender,
        addSenderRecipient: s.addSenderRecipient,
        sign: s.sign,
      }),
      (s) => {
        const recs = s.recipients.map((k: Key) => k.id!)
        const config = {
          encrypt: {
            recipients: recs,
            sender: s.sender?.id,
            noSenderRecipient: !s.addSenderRecipient,
            noSign: !s.sign,
          },
        }
        console.log('Set config:', config)
        const set = async () => await configSet({key: 'encrypt', config})
        set()
      }
    )
  }, [])

  const canEncryptFile = fileIn && recipients.length > 0
  const showEncryptFileButton = canEncryptFile && fileIn && !fileOut
  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Box style={{paddingLeft: 8, paddingTop: 5, paddingBottom: 5, paddingRight: 8}}>
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
      <Divider />
      <Box display="flex" style={{position: 'relative'}}>
        <Box display="flex" flex={1} flexDirection="row">
          <SignKeySelectView
            value={sender}
            onChange={(sender?: Key) =>
              store.update((s) => {
                s.sender = sender
              })
            }
            disabled={loading}
            placeholder="Anonymous"
          />

          <IconButton
            color={addSenderRecipient ? 'primary' : 'inherit'}
            style={{paddingTop: 10, paddingBottom: 10}}
            onClick={() =>
              store.update((s) => {
                s.addSenderRecipient = !addSenderRecipient
              })
            }
            disabled={!sender}
          >
            <Tooltip title="Add to Recipients">
              <AddRecipientIcon style={{color: addSenderRecipient ? '' : '#999'}} />
            </Tooltip>
          </IconButton>

          <IconButton
            color={sign ? 'primary' : 'inherit'}
            style={{paddingTop: 10, paddingBottom: 10}}
            onClick={() =>
              store.update((s) => {
                s.sign = !sign
              })
            }
            disabled={!sender}
          >
            <Tooltip title="Sign">
              <SignIcon style={{color: sign ? '' : '#999'}} />
            </Tooltip>
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <Box style={{position: 'relative', height: '47%'}}>
        {fileIn && (
          <Box style={{paddingTop: 6, paddingLeft: 8}}>
            <Typography style={{...styles.mono, display: 'inline'}}>{fileIn}&nbsp;</Typography>
            <Link inline onClick={() => clear(false)} disabled={loading}>
              Clear
            </Link>
          </Box>
        )}
        {!fileIn && (
          <Box style={{height: '100%'}}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={onInputChange}
              spellCheck="false"
              style={{
                height: 'calc(100% - 16px)',
                width: 'calc(100% - 8px)',
                overflow: 'auto',
                border: 'none',
                padding: 0,
                color: 'rgba(0, 0, 0, 0.87)',
                fontSize: '0.857rem',
                fontFamily: 'Open Sans',
                fontWeight: 400,
                outline: 0,
                resize: 'none',
                paddingTop: 8,
                paddingLeft: 8,
                paddingBottom: 8,
              }}
            />
            {!input && (
              <Box style={{position: 'absolute', top: 6, left: 8}}>
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
        <Box style={{position: 'absolute', bottom: 0, width: '100%'}}>
          {!loading && <Divider />}
          {loading && <LinearProgress />}
        </Box>
      </Box>
      <Box
        style={{
          height: '53%',
          width: '100%',
        }}
      >
        {error && (
          <Box style={{paddingLeft: 10, paddingTop: 10}}>
            <Typography style={{...styles.mono, color: 'red', display: 'inline'}}>{error.message}</Typography>
          </Box>
        )}
        {!error && showEncryptFileButton && (
          <EncryptToButton
            onClick={() => encryptFileTo(fileIn, recipients, sender, addSenderRecipient, sign)}
            disabled={loading}
          />
        )}
        {!error && !showEncryptFileButton && fileOut && <EncryptedFileView fileOut={fileOut} />}
        {!error && !showEncryptFileButton && !fileOut && <EncryptedView value={output} />}
      </Box>
    </Box>
  )
}
