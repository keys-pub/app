import * as React from 'react'

import * as path from 'path'

import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Input,
  LinearProgress,
  Typography,
  Box,
} from '@material-ui/core'

import {Link, styles} from '../../components'
import AutocompletesView from '../keys/autocompletes'
import EncryptedView from './encrypted'
import EncryptedFileView from './encryptedfile'
import SignKeySelectView from '../keys/select'

import {remote} from 'electron'
import * as grpc from '@grpc/grpc-js'
import {Store} from 'pullstate'

import {encrypt, encryptFile, EncryptFileEvent} from '../../rpc/keys'
import {
  Key,
  EncryptMode,
  EncryptRequest,
  EncryptResponse,
  EncryptFileInput,
  EncryptFileOutput,
} from '../../rpc/keys.d'

type State = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  recipients: Key[]
  sender?: Key
  error?: Error
  loading: boolean
  // includeSelf?: boolean
}

const initialState: State = {
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  recipients: [],
  loading: false,
}

const store = new Store(initialState)

// TODO: Option to include self/sender
// TODO: Default sender

const openFile = async () => {
  clear(true)
  const open = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {})
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

const encryptInput = async (input: string, recipients: Key[], sender?: Key) => {
  if (!input || recipients.length == 0) {
    clear(true)
    return
  }

  const recs = recipients.map((k: Key) => k.id!)

  console.log('Encrypting...')
  const data = new TextEncoder().encode(input)
  const req: EncryptRequest = {
    data: data,
    armored: true,
    recipients: recs,
    sender: sender?.id || '',
    mode: EncryptMode.DEFAULT_ENCRYPT,
  }

  try {
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

const encryptFileIn = (fileIn: string, dir: string, recipients: Key[], sender?: Key) => {
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
    sender: sender?.id || '',
    mode: EncryptMode.DEFAULT_ENCRYPT,
    armored: false,
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

const encryptFileTo = async (fileIn: string, recipients: Key[], sender?: Key) => {
  const open = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'],
  })
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const dir = open.filePaths[0]
    encryptFileIn(fileIn, dir, recipients, sender)
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
  const inputRef = React.useRef<HTMLInputElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {
    input,
    output,
    fileIn,
    fileOut,
    error,
    recipients,
    sender,
    // includeSelf,
    loading,
  } = store.useState()

  React.useEffect(() => {
    if (fileIn == '') {
      encryptInput(input, recipients, sender)
    }
  }, [input, recipients, sender])

  const canEncryptFile = fileIn && recipients.length > 0
  const showEncryptFileButton = canEncryptFile && fileIn && !fileOut
  return (
    <Box
      display="flex"
      flex={1}
      flexDirection="column"
      // style={{height: '100%', position: 'relative', overflow: 'hidden'}}
    >
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
      <Box display="flex">
        <Box display="flex" flex={1}>
          <SignKeySelectView
            value={sender}
            onChange={(sender?: Key) =>
              store.update((s) => {
                s.sender = sender
              })
            }
            disabled={loading}
            placeholder="Anonymous"
            itemLabel="Signed by"
          />
        </Box>
        {/* <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={!!includeSelf}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                EncryptStore.update((s) => {
                  s.includeSelf = event.target.checked
                })
              }}
            />
          }
          label="Include Self"
        /> */}
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
            <Input
              multiline
              autoFocus
              onChange={onInputChange}
              value={input}
              disableUnderline
              inputProps={{
                ref: inputRef,
                spellCheck: 'false',
                style: {
                  height: '100%',
                  overflow: 'auto',
                  paddingTop: 8,
                  paddingLeft: 8,
                  paddingBottom: 0,
                  paddingRight: 0,
                },
              }}
              style={{
                height: '100%',
                width: '100%',
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
                <Link inline onClick={() => openFile()}>
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
          <EncryptToButton onClick={() => encryptFileTo(fileIn, recipients, sender)} disabled={loading} />
        )}
        {!error && !showEncryptFileButton && fileOut && <EncryptedFileView fileOut={fileOut} />}
        {!error && !showEncryptFileButton && !fileOut && <EncryptedView value={output} />}
      </Box>
    </Box>
  )
}
