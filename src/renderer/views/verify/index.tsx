import * as React from 'react'

import {Divider, Button, Box, Input, LinearProgress, Typography} from '@material-ui/core'

import VerifiedView from './verified'
import VerifiedFileView from './verifiedfile'

import {styles, Link} from '../../components'
import {remote} from 'electron'
import * as grpc from '@grpc/grpc-js'
import {Store} from 'pullstate'

import {verify, verifyFile, key, VerifyFileEvent} from '../../rpc/keys'
import {
  Key,
  EncryptMode,
  KeyRequest,
  KeyResponse,
  VerifyFileInput,
  VerifyFileOutput,
  VerifyRequest,
  VerifyResponse,
} from '../../rpc/keys.d'

type State = {
  input: string
  output: string
  fileIn: string
  fileOut: string
  signer?: Key
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
  clearOut()
  const win = remote.getCurrentWindow()
  const open = await remote.dialog.showOpenDialog(win, {})
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

const clear = () => {
  // TODO: Stream cancel?
  store.update((s) => {
    s.input = ''
    s.output = ''
    s.fileIn = ''
    s.fileOut = ''
    s.signer = undefined
    s.error = undefined
  })
}

const clearOut = () => {
  store.update((s) => {
    s.output = ''
    s.fileOut = ''
    s.signer = undefined
    s.error = undefined
  })
}

const setError = (err: Error) => {
  store.update((s) => {
    s.error = err
  })
}

const reloadSigner = (kid?: string) => {
  if (!kid) {
    store.update((s) => {
      s.signer = undefined
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
        s.signer = resp.key
      })
    })
    .catch(setError)
}

const verifyInput = (input: string) => {
  if (input == '') {
    clearOut()
    return
  }

  console.log('Verifying...')
  const data = new TextEncoder().encode(input)
  const req: VerifyRequest = {
    data: data,
  }
  verify(req)
    .then((resp: VerifyResponse) => {
      const verified = new TextDecoder().decode(resp.data)
      store.update((s) => {
        s.signer = resp.signer
        s.error = undefined
        s.output = verified
        s.fileOut = ''
      })
    })
    .catch(setError)
}

const verifyFileIn = (fileIn: string, dir: string) => {
  clearOut()

  if (fileIn == '') return

  const req: VerifyFileInput = {
    in: fileIn,
    out: dir,
  }
  console.log('Verifying file...')
  store.update((s) => {
    s.loading = true
  })
  const send = verifyFile((event: VerifyFileEvent) => {
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
        s.signer = res?.signer
        s.error = undefined
        s.output = ''
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

const verifyFileTo = async (fileIn: string) => {
  const open = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'],
  })
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const dir = open.filePaths[0]
    verifyFileIn(fileIn, dir)
  }
}

const VerifyToButton = (props: {onClick: () => void; disabled: boolean}) => (
  <Box style={{marginLeft: 10, marginTop: 10}}>
    <Button color="primary" variant="outlined" disabled={props.disabled} onClick={props.onClick}>
      Verify to
    </Button>
  </Box>
)

export default (props: {}) => {
  const inputRef = React.useRef<HTMLInputElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {input, output, fileIn, fileOut, error, signer, loading} = store.useState()

  React.useEffect(() => {
    if (fileIn == '') {
      verifyInput(input)
    }
  }, [input])

  const showVerifyFileButton = fileIn && !fileOut

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
                  onClick={() => inputRef.current?.focus()}
                >
                  Enter signed text or{' '}
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
        {error && (
          <Box style={{paddingLeft: 10, paddingTop: 10}}>
            <Typography style={{...styles.mono, color: 'red', display: 'inline'}}>{error.message}</Typography>
          </Box>
        )}
        {!error && showVerifyFileButton && (
          <VerifyToButton onClick={() => verifyFileTo(fileIn)} disabled={loading} />
        )}
        {!error && !showVerifyFileButton && fileOut && (
          <VerifiedFileView fileOut={fileOut} signer={signer} reloadKey={() => reloadSigner(signer?.id)} />
        )}
        {!error && !showVerifyFileButton && !fileOut && (
          <VerifiedView value={output} signer={signer} reloadSigner={() => reloadSigner(signer?.id)} />
        )}
      </Box>
    </Box>
  )
}
