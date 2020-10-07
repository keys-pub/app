import * as React from 'react'

import {Button, Divider, LinearProgress, IconButton, Input, Typography, Box} from '@material-ui/core'

import {Link} from '../components'
import {CopyIcon} from '../icons'

import {clipboard, shell, ipcRenderer, OpenDialogReturnValue} from 'electron'
import * as grpc from '@grpc/grpc-js'
import * as path from 'path'

import SignKeySelectView from '../keys/select'

import {keys, sign, configGet, configSet, signFile, SignFileEvent} from '../rpc/keys'
import {Key, Config, SignRequest, SignResponse, SignFileInput, SignFileOutput} from '../rpc/keys.d'
import {store, loadStore} from './store'
import {closeSnack, openSnack, openSnackError} from '../snack'
import {contentTop, column2Color} from '../theme'

const openFile = async () => {
  clearOut()
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

const clear = () => {
  closeSnack()
  // TODO: Stream cancel?
  store.update((s) => {
    s.input = ''
    s.output = ''
    s.fileIn = ''
    s.fileOut = ''
    s.signer = undefined
    s.loading = false
  })
}

const clearOut = () => {
  closeSnack()
  store.update((s) => {
    s.output = ''
    s.fileOut = ''
  })
}

const copyToClipboard = (value: string) => {
  clipboard.writeText(value)
  openSnack({message: 'Copied to Clipboard', duration: 2000})
}

const openFolder = (value: string) => {
  shell.showItemInFolder(value)
}

const signInput = async (input: string, signer?: Key) => {
  if (!input || !signer) {
    clearOut()
    return
  }

  console.log('Signing...')
  try {
    const data = new TextEncoder().encode(input)
    const resp = await sign({
      data: data,
      armored: true,
      signer: signer?.id,
      detached: false,
    })
    const signed = new TextDecoder().decode(resp.data)
    store.update((s) => {
      s.output = signed
      s.fileOut = ''
    })
  } catch (err) {
    clearOut()
    openSnackError(err)
  }
}

const signFileIn = (fileIn: string, dir: string, signer: Key) => {
  clearOut()

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
  store.update((s) => {
    s.loading = true
  })
  const send = signFile((event: SignFileEvent) => {
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
        s.fileOut = res?.out || ''
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

const signFileTo = async (fileIn: string, signer?: Key) => {
  clearOut()
  if (fileIn == '' || !signer) {
    return
  }

  const open: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
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

type Props = {}

export default (props: Props) => {
  const inputRef = React.useRef<HTMLTextAreaElement>()

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLTextAreaElement
    store.update((s) => {
      s.input = target.value || ''
    })
  }, [])

  const {input, output, fileIn, fileOut, signer, loading} = store.useState()

  React.useEffect(() => {
    if (fileIn == '') {
      signInput(input, signer)
    } else if (fileOut != '') {
      store.update((s) => {
        s.fileOut = ''
      })
    }
  }, [input, signer])

  React.useEffect(() => {
    loadStore()

    return store.createReaction(
      (s) => ({
        signer: s.signer,
      }),
      (s) => {
        const config: Config = {
          sign: {
            signer: s.signer?.id,
          },
        }
        const set = async () => await configSet({name: 'sign', config})
        set()
      }
    )
  }, [])

  const canSign = fileIn && signer
  const showButton = canSign && fileIn && !fileOut
  const left = 10

  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Box style={{marginLeft: left, marginTop: contentTop, marginBottom: 4}}>
        <Typography variant="h4">Sign</Typography>
      </Box>
      <Box>
        <SignKeySelectView
          value={signer}
          onChange={(k) => {
            store.update((s) => {
              s.signer = k
            })
          }}
          placeholder="Choose a Signer"
          placeholderDisabled
          label="Signed by"
          SelectDisplayProps={{
            style: {
              paddingLeft: left,
            },
          }}
        />
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
              <Link inline onClick={() => clear()} disabled={loading}>
                Clear
              </Link>
            </Box>
            {showButton && (
              <Box marginTop={1}>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  onClick={() => signFileTo(fileIn, signer)}
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
                  Type text to sign or{' '}
                </Typography>
                <Link inline onClick={openFile}>
                  select a signed file
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
