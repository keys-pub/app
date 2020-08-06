import * as React from 'react'

import {Divider, Box, Input, LinearProgress, Typography} from '@material-ui/core'

import DecryptedView from './decrypted'
import DecryptedFileView from './decryptedfile'

import {styles, Link} from '../../components'
import {remote} from 'electron'
import * as grpc from '@grpc/grpc-js'

import {decrypt, decryptFile, key} from '../../rpc/keys'
import {
  Key,
  EncryptMode,
  RPCError,
  KeyRequest,
  KeyResponse,
  DecryptFileInput,
  DecryptFileOutput,
  DecryptRequest,
  DecryptResponse,
} from '../../rpc/keys.d'

import {DecryptStore} from '../../store/pull'

const openFile = async () => {
  clearOut()
  const win = remote.getCurrentWindow()
  const open = await remote.dialog.showOpenDialog(win, {})
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const file = open.filePaths[0]

    DecryptStore.update((s) => {
      s.fileIn = file
    })
  }
}

const clear = () => {
  // TODO: Stream cancel?
  DecryptStore.update((s) => {
    s.input = ''
    s.output = ''
    s.fileIn = ''
    s.fileOut = ''
    s.error = ''
  })
}

const clearOut = () => {
  DecryptStore.update((s) => {
    s.output = ''
    s.fileOut = ''
    s.sender = null
    s.mode = null
    s.error = ''
  })
}

const reloadSender = (kid: string) => {
  const req: KeyRequest = {
    key: kid,
  }
  key(req, (err: RPCError, resp: KeyResponse) => {
    if (err) {
      DecryptStore.update((s) => {
        s.error = err.details
      })
      return
    }
    if (resp.key) {
      DecryptStore.update((s) => {
        s.sender = resp.key
      })
    }
  })
}

const decryptInput = (input: string) => {
  clearOut()

  if (input == '') return

  const data = new TextEncoder().encode(input)
  const req: DecryptRequest = {
    data: data,
  }
  decrypt(req, (err: RPCError, resp: DecryptResponse) => {
    if (err) {
      DecryptStore.update((s) => {
        s.error = err.details
      })
      return
    }
    const decrypted = new TextDecoder().decode(resp.data)
    DecryptStore.update((s) => {
      s.sender = resp.sender
      s.error = ''
      s.output = decrypted
      s.fileOut = ''
      s.mode = resp.mode
    })
  })
}

const decryptFileIn = (fileIn: string) => {
  clearOut()

  if (fileIn == '') return

  const req: DecryptFileInput = {
    in: fileIn,
  }
  console.log('Decrypting...')
  DecryptStore.update((s) => {
    s.loading = true
  })
  const send = decryptFile((err: RPCError, resp: DecryptFileOutput, done: boolean) => {
    if (err) {
      if (err.code == grpc.status.CANCELLED) {
        DecryptStore.update((s) => {
          s.loading = false
        })
      } else {
        DecryptStore.update((s) => {
          s.error = err.details
          s.loading = false
        })
      }
      return
    }
    if (resp) {
      DecryptStore.update((s) => {
        s.fileOut = resp.out
        s.sender = resp.sender
        s.error = ''
        s.output = ''
        s.mode = resp.mode
      })
    }
    if (done) {
      DecryptStore.update((s) => {
        s.loading = false
      })
    }
  })
  send(req, false)
}

export default (props: {}) => {
  const inputRef = React.useRef<HTMLInputElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    DecryptStore.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {input, output, fileIn, fileOut, error, sender, mode, loading} = DecryptStore.useState()

  React.useEffect(() => {
    if (fileOut == '') {
      decryptFileIn(fileIn)
    }
  }, [fileIn])

  React.useEffect(() => {
    if (fileIn == '') {
      decryptInput(input)
    }
  }, [input])

  return (
    <Box display="flex" flex={1} flexDirection="column" style={{overflow: 'hidden'}}>
      <Box style={{position: 'relative', height: '40%'}}>
        {fileIn && (
          <Box style={{paddingTop: 8, paddingLeft: 8}}>
            <Typography style={{...styles.mono, display: 'inline'}}>{fileIn}&nbsp;</Typography>
            <Link inline onClick={clear}>
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
                spellCheck: 'false',
                ref: inputRef,
                style: {
                  ...styles.mono,
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
                  onClick={() => inputRef.current.focus()}
                >
                  Enter encrypted text or{' '}
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
          height: '60%',
          width: '100%',
        }}
      >
        {(fileOut || error) && (
          <DecryptedFileView
            fileOut={fileOut}
            sender={sender}
            mode={mode}
            error={error}
            reloadKey={() => reloadSender(sender.id)}
          />
        )}
        {!error && !fileOut && (
          <DecryptedView
            decrypted={output}
            sender={sender}
            mode={mode}
            reloadSender={() => reloadSender(sender.id)}
          />
        )}
      </Box>
    </Box>
  )
}
