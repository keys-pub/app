import * as React from 'react'

import {Divider, Button, Box, Input, LinearProgress, Typography} from '@material-ui/core'

import DecryptedView from './decrypted'
import DecryptedFileView from './decryptedfile'

import {Link} from '../components'
import {mono} from '../theme'
import {ipcRenderer, OpenDialogReturnValue} from 'electron'
import * as grpc from '@grpc/grpc-js'
import {Store} from 'pullstate'

import {decrypt, decryptFile, key, DecryptFileEvent} from '../rpc/keys'
import {
  Key,
  EncryptMode,
  KeyRequest,
  KeyResponse,
  DecryptFileInput,
  DecryptFileOutput,
  DecryptRequest,
  DecryptResponse,
} from '../rpc/keys.d'

type State = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  mode?: EncryptMode
  sender?: Key
  error?: Error
  loading: boolean
}

const store = new Store<State>({
  input: '',
  output: '',
  fileIn: '',
  fileOut: '',
  loading: false,
})

const openFile = async () => {
  clear(true)

  const open: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog')
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const file = open.filePaths[0]

    store.update((s) => {
      s.fileIn = file
    })
  }
}

const clear = (outOnly: boolean) => {
  // TODO: Stream cancel?
  if (outOnly) {
    store.update((s) => {
      s.output = ''
      s.fileOut = ''
      s.sender = undefined
      s.mode = undefined
      s.error = undefined
    })
  } else {
    store.update((s) => {
      s.input = ''
      s.output = ''
      s.fileIn = ''
      s.fileOut = ''
      s.sender = undefined
      s.mode = undefined
      s.error = undefined
      s.loading = false
    })
  }
}

const reloadSender = (kid?: string) => {
  if (!kid) {
    store.update((s) => {
      s.sender = undefined
    })
    return
  }
  const req: KeyRequest = {
    key: kid,
    search: false,
    update: false,
  }
  key(req)
    .then((resp: KeyResponse) => {
      store.update((s) => {
        s.sender = resp.key
      })
    })
    .catch((err: Error) => {
      store.update((s) => {
        s.error = err
      })
    })
}

const decryptInput = async (input: string) => {
  if (input == '') {
    clear(true)
    return
  }

  console.log('Decrypting...')
  try {
    const data = new TextEncoder().encode(input)
    const req: DecryptRequest = {
      data: data,
    }
    const resp = await decrypt(req)
    const decrypted = new TextDecoder().decode(resp.data)
    store.update((s) => {
      s.sender = resp.sender
      s.error = undefined
      s.output = decrypted
      s.fileOut = ''
      s.mode = resp.mode
    })
  } catch (err) {
    store.update((s) => {
      s.error = err
    })
  }
}

const decryptFileIn = (fileIn: string, dir: string) => {
  clear(true)

  if (fileIn == '') return

  const req: DecryptFileInput = {
    in: fileIn,
    out: dir,
  }
  console.log('Decrypting file...')
  store.update((s) => {
    s.loading = true
  })
  const send = decryptFile((event: DecryptFileEvent) => {
    const {err, res, done} = event
    if (err) {
      if (err.code == grpc.status.CANCELLED) {
        store.update((s) => {
          s.loading = false
        })
      } else {
        store.update((s) => {
          s.error = err
          s.loading = false
        })
      }
      return
    }
    if (res) {
      store.update((s) => {
        s.fileOut = res?.out || ''
        s.sender = res?.sender
        s.error = undefined
        s.output = ''
        s.mode = res?.mode
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

const decryptFileTo = async (fileIn: string) => {
  const open: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
    properties: ['openDirectory'],
  })
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const dir = open.filePaths[0]
    decryptFileIn(fileIn, dir)
  }
}

const DecryptToButton = (props: {onClick: () => void; disabled: boolean}) => (
  <Box style={{marginLeft: 10, marginTop: 10}}>
    <Button color="primary" variant="outlined" disabled={props.disabled} onClick={props.onClick}>
      Decrypt to
    </Button>
  </Box>
)

export default (_: {}) => {
  const inputRef = React.useRef<HTMLTextAreaElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLTextAreaElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {input, output, fileIn, fileOut, error, sender, mode, loading} = store.useState()

  React.useEffect(() => {
    if (fileIn == '') {
      decryptInput(input)
    }
  }, [input])

  const showDecryptFileButton = fileIn && !fileOut

  return (
    <Box display="flex" flex={1} flexDirection="column" style={{overflow: 'hidden'}}>
      <Box style={{position: 'relative', height: '40%'}}>
        {fileIn && (
          <Box style={{paddingTop: 8, paddingLeft: 8}}>
            <Typography variant="body2" style={{display: 'inline'}}>
              {fileIn}&nbsp;
            </Typography>
            <Link inline onClick={() => clear(false)}>
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
                ...mono,
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
                  Enter encrypted text or{' '}
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
          height: '60%',
          width: '100%',
        }}
      >
        {error && (
          <Box style={{paddingLeft: 10, paddingTop: 10}}>
            <Typography variant="body2" style={{color: 'red', display: 'inline'}}>
              {error.message}
            </Typography>
          </Box>
        )}
        {!error && showDecryptFileButton && (
          <DecryptToButton onClick={() => decryptFileTo(fileIn)} disabled={loading} />
        )}
        {!error && !showDecryptFileButton && fileOut && (
          <DecryptedFileView
            fileOut={fileOut}
            sender={sender}
            mode={mode}
            reloadKey={() => reloadSender(sender?.id)}
          />
        )}
        {!error && !showDecryptFileButton && !fileOut && (
          <DecryptedView
            value={output}
            sender={sender}
            mode={mode}
            reloadSender={() => reloadSender(sender?.id)}
          />
        )}
      </Box>
    </Box>
  )
}
