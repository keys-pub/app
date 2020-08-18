import * as React from 'react'

import {Button, Divider, LinearProgress, Input, Typography, Box} from '@material-ui/core'

import {styles, Link} from '../../components'

import {remote} from 'electron'
import * as grpc from '@grpc/grpc-js'
import * as path from 'path'

import SignedView from './signed'
import SignFileView from './signedfile'
import SignKeySelectView from '../keys/select'

import {sign, signFile, SignFileEvent} from '../../rpc/keys'
import {Key, SignRequest, SignResponse, SignFileInput, SignFileOutput} from '../../rpc/keys.d'

import {SignStore as Store} from '../../store'

const openFile = async () => {
  clearOut()
  const open = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {})
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const file = open.filePaths[0]

    Store.update((s) => {
      s.fileIn = file || ''
    })
  }
}

const clear = () => {
  // TODO: Stream cancel?
  Store.update((s) => {
    s.input = ''
    s.output = ''
    s.fileIn = ''
    s.fileOut = ''
    s.signer = undefined
    s.error = undefined
    s.loading = false
  })
}

const clearOut = () => {
  Store.update((s) => {
    s.output = ''
    s.fileOut = ''
    s.error = undefined
  })
}

const setError = (err: Error) => {
  Store.update((s) => {
    s.error = err
  })
}

const signInput = (input: string, signer?: Key) => {
  if (!input || !signer) {
    clearOut()
    return
  }

  console.log('Signing...')
  const data = new TextEncoder().encode(input)
  const req: SignRequest = {
    data: data,
    armored: true,
    signer: signer?.id,
    detached: false,
  }
  sign(req)
    .then((resp: SignResponse) => {
      const signed = new TextDecoder().decode(resp.data)
      Store.update((s) => {
        s.output = signed
        s.fileOut = ''
        s.error = undefined
      })
    })
    .catch(setError)
}

const signFileIn = (fileIn: string, dir: string, signer: Key) => {
  const baseOut = path.basename(fileIn)
  const fileOut = path.join(dir, baseOut + '.signed')

  const req: SignFileInput = {
    in: fileIn,
    out: fileOut,
    signer: signer?.id,
    armored: false,
    detached: false,
  }

  console.log('Signing file...')
  Store.update((s) => {
    s.loading = true
  })
  const send = signFile((event: SignFileEvent) => {
    const {err, res, done} = event
    if (err) {
      if (err.code == grpc.status.CANCELLED) {
        Store.update((s) => {
          s.loading = false
        })
      } else {
        Store.update((s) => {
          s.error = err
          s.loading = false
        })
      }
      return
    }
    if (res) {
      Store.update((s) => {
        s.output = ''
        s.fileOut = res?.out || ''
        s.error = undefined
      })
    }
    if (done) {
      Store.update((s) => {
        s.loading = false
      })
    }
  })
  send(req, false)
}

const signFileTo = async (fileIn: string, signer?: Key) => {
  clearOut()
  if (fileIn == '' || !signer) {
    return
  }

  const open = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'],
  })
  if (open.canceled) {
    return
  }
  if (open.filePaths.length == 1) {
    const dir = open.filePaths[0]
    signFileIn(fileIn, dir, signer)
  }
}

const SignToButton = (props: {onClick: () => void; disabled: boolean}) => (
  <Box style={{marginLeft: 10, marginTop: 10}}>
    <Button color="primary" variant="outlined" disabled={props.disabled} onClick={props.onClick}>
      Sign to
    </Button>
  </Box>
)

type Props = {}

export default (props: Props) => {
  const inputRef = React.useRef<HTMLInputElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    Store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {input, output, fileIn, fileOut, error, signer, loading} = Store.useState()

  React.useEffect(() => {
    if (fileIn == '') {
      signInput(input, signer)
    }
  }, [input, signer])

  const canSign = fileIn && signer
  const showButton = canSign && fileIn && !fileOut

  return (
    <Box
      display="flex"
      flex={1}
      flexDirection="column"
      // style={{height: '100%', position: 'relative', overflow: 'hidden'}}
    >
      <SignKeySelectView
        value={signer}
        onChange={(k) => {
          Store.update((s) => {
            s.signer = k
          })
        }}
        placeholder="Signer"
        placeholderDisabled
        itemLabel="Signed by"
      />
      <Divider />
      <Box style={{position: 'relative', height: '47%'}}>
        {fileIn && (
          <Box style={{paddingTop: 6, paddingLeft: 8}}>
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
                  Type text or{' '}
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
        {!error && showButton && (
          <SignToButton onClick={() => signFileTo(fileIn, signer)} disabled={loading} />
        )}
        {!error && !showButton && fileOut && <SignFileView fileOut={fileOut} />}
        {!error && !showButton && !fileOut && <SignedView value={output} />}
      </Box>
    </Box>
  )
}
