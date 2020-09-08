import * as React from 'react'

import {Box, TextField, TextFieldProps, Typography} from '@material-ui/core'
// import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete from '@material-ui/lab/Autocomplete'

import UserLabel from '../user/label'
import matchSorter from 'match-sorter'

import SearchDialog from '../search/dialog'
import KeyImportDialog from '../import'
import Snack, {SnackProps} from '../../components/snack'

import {keys as listKeys} from '../../rpc/keys'
import {Key, KeysRequest, KeysResponse, SortDirection} from '../../rpc/keys.d'

type Props = {
  keys: Key[]
  onChange: (value: Key[]) => void
  disabled?: boolean
  placeholder?: string
  searchOption?: boolean
  importOption?: boolean
  id?: string
}

const createOptions = (options: Key[], searchOption: boolean, importOption: boolean): Key[] => {
  if (searchOption) {
    options = options.filter((k: Key) => k.id != 'search')
    options.push({id: 'search'} as Key)
  }
  if (importOption) {
    options = options.filter((k: Key) => k.id != 'import')
    options.push({id: 'import'} as Key)
  }
  return options
}

const renderOption = (option: Key) => {
  if (option.id == 'search') {
    return <Typography style={{color: '#2196f3'}}>Search for key</Typography>
  }
  if (option.id == 'import') {
    return <Typography style={{color: '#2196f3'}}>Import key</Typography>
  }
  return (
    <React.Fragment>
      <UserLabel kid={option.id!} user={option.user} />
    </React.Fragment>
  )
}

const optionSelected = (option: Key, value: Key): boolean => {
  return option.id == value.id
}

export default (props: Props) => {
  const filterOptions = (options: Key[], {inputValue}: {inputValue: string}) => {
    const filter = matchSorter(options, inputValue, {keys: ['user.id', 'id']})
    return createOptions(filter, !!props.searchOption, !!props.importOption)
  }

  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [options, setOptions] = React.useState(props.keys)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [snack, setSnack] = React.useState<SnackProps>()
  const [snackOpen, setSnackOpen] = React.useState(false)

  const openAutoComplete = () => {
    setOpen(true)
  }

  const lookupOption = (option: Key): Key => {
    const found = options.find((k: Key) => k.id == option.id)
    return found || option
  }

  const getOptionLabel = (option: Key): string => {
    option = lookupOption(option)
    if (option.id == 'search' || option.id == 'import') {
      return ''
    }
    return ((<UserLabel kid={option.id!} user={option.user} />) as unknown) as string
  }

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    const q = target.value || ''
    setInput(q)
  }, [])

  const search = async (q: string) => {
    const req: KeysRequest = {
      query: q,
    }
    try {
      const resp = await listKeys(req)
      const keys = createOptions(resp.keys || [], !!props.searchOption, !!props.importOption)
      setOptions(keys || [])
    } catch (err) {
      setSnack({message: err.message, alert: 'error', duration: 4000})
      setSnackOpen(true)
    }
  }

  React.useEffect(() => {
    search(input)
  }, [input])

  const reload = () => {
    search(input)
  }

  const closeImport = () => {
    setImportOpen(false)
    reload()
  }

  const onChange = (event: React.ChangeEvent<{}>, value: any) => {
    let keys = value as Key[]

    keys.forEach((k: Key) => {
      if (k.id == 'search') {
        setSearchOpen(true)
      }
      if (k.id == 'import') {
        setImportOpen(true)
      }
    })

    keys = keys.filter((k: Key) => k.id != 'search' && k.id != 'import')
    props.onChange(keys)
  }

  return (
    <Box style={{width: '100%'}}>
      <Autocomplete
        id={props.id}
        open={open}
        disabled={props.disabled}
        onOpen={openAutoComplete}
        onClose={() => setOpen(false)}
        multiple
        filterOptions={filterOptions}
        onInputChange={onInputChange}
        onChange={onChange}
        value={props.keys}
        getOptionSelected={optionSelected}
        getOptionLabel={getOptionLabel}
        options={options}
        ChipProps={{variant: 'outlined', size: 'small', style: {marginLeft: 0, marginRight: 5}}} //  icon: <FaceIcon />,
        renderOption={renderOption}
        popupIcon={null}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={props.placeholder}
            fullWidth
            inputProps={{
              ...params.inputProps,
              style: {fontSize: 13.7143, color: 'black'}, // TODO: Font size
            }}
            InputProps={{
              ...params.InputProps,
              style: {minHeight: 31},
              disableUnderline: true,
              // endAdornment: (
              //   <React.Fragment>
              //     {loading ? <CircularProgress color="inherit" size={20} /> : null}
              //     {params.InputProps.endAdornment}
              //   </React.Fragment>
              // ),
            }}
          />
        )}
      />
      <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} reload={reload} />
      <KeyImportDialog open={importOpen} close={closeImport} />
      <Snack open={snackOpen} {...snack} onClose={() => setSnackOpen(false)} />
    </Box>
  )
}
