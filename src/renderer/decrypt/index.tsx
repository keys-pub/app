import * as React from 'react'

import {Divider, Button, Box, IconButton, Input, LinearProgress, Typography} from '@material-ui/core'

import {SignIcon, CopyIcon} from '../icons'
import Link from '../components/link'
import {mono} from '../theme'
import {clipboard, shell, ipcRenderer, OpenDialogReturnValue} from 'electron'
import * as grpc from '@grpc/grpc-js'
import {Store} from 'pullstate'
import {contentTop, column2Color} from '../theme'
import {closeSnack, openSnack, openSnackError} from '../snack'
import SignerView from '../verify/signer'

import {rpc} from '../rpc/client'
import {RPCError} from '@keys-pub/tsclient'
import {
  Key,
  EncryptMode,
  KeyRequest,
  KeyResponse,
  DecryptFileInput,
  DecryptFileOutput,
  DecryptRequest,
  DecryptResponse,
} from '@keys-pub/tsclient/lib/rpc'

type State = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  mode?: EncryptMode
  sender?: Key
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
  closeSnack()
  // TODO: Stream cancel?
  if (outOnly) {
    store.update((s) => {
      s.output = ''
      s.fileOut = ''
      s.sender = undefined
      s.mode = undefined
    })
  } else {
    store.update((s) => {
      s.input = ''
      s.output = ''
      s.fileIn = ''
      s.fileOut = ''
      s.sender = undefined
      s.mode = undefined
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

const reloadSender = async (kid: string) => {
  try {
    const resp = await rpc.key({
      key: kid,
      search: false,
      update: false,
    })
    store.update((s) => {
      s.sender = resp.key
    })
  } catch (err) {
    openSnackError(err)
  }
}

const decryptInput = async (input: string) => {
  if (input == '') {
    clear(true)
    return
  }
  closeSnack()

  console.log('Decrypting...')
  try {
    const data = new TextEncoder().encode(input)
    const req: DecryptRequest = {
      data: data,
    }
    const resp = await rpc.decrypt(req)
    const decrypted = new TextDecoder().decode(resp.data)
    store.update((s) => {
      s.sender = resp.sender
      s.output = decrypted
      s.fileOut = ''
      s.mode = resp.mode
    })
  } catch (err) {
    clear(true)
    openSnackError(err)
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
  const stream = rpc.decryptFile()
  stream.on('data', (resp: DecryptFileOutput) => {
    store.update((s) => {
      s.output = ''
      s.fileOut = resp?.out || ''
      s.sender = resp?.sender
      s.mode = resp?.mode
    })
  })
  stream.on('error', (err: RPCError) => {
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
  })
  stream.on('end', () => {
    store.update((s) => {
      s.loading = false
    })
  })
  stream.write(req)
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

export default (_: {}) => {
  const inputRef = React.useRef<HTMLTextAreaElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLTextAreaElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {input, output, fileIn, fileOut, sender, mode, loading} = store.useState()

  React.useEffect(() => {
    if (fileIn == '') {
      decryptInput(input)
    }
  }, [input])

  const showDecryptFileButton = fileIn && !fileOut
  const left = 10

  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Box style={{marginLeft: left, marginTop: contentTop, marginBottom: 4}}>
        <Typography variant="h4">Decrypt</Typography>
      </Box>
      <Box display="flex" flexDirection="column" flex={0.75} style={{position: 'relative'}}>
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
            {showDecryptFileButton && (
              <Box marginTop={1}>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  onClick={() => decryptFileTo(fileIn)}
                  disabled={loading}
                >
                  Decrypt to
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
                ...mono,
                height: 'calc(100% - 16px)',
                width: 'calc(100% - ' + left + 'px)',
                overflowY: 'auto',
                border: 'none',
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
              <Box style={{position: 'absolute', top: 6, left: left}}>
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
        <Box style={{position: 'absolute', bottom: 0, width: '100%'}}>{loading && <LinearProgress />}</Box>
      </Box>
      <Box display="flex" flexDirection="column" flex={1}>
        <SignerView signer={sender} mode={mode} unsigned={!sender && !!output} reload={reloadSender} />
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
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 10,
              // borderRadius: 10,
              backgroundColor: column2Color,
            }}
          >
            {output && (
              <Typography style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>{output}</Typography>
            )}
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
    </Box>
  )
}
