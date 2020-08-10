import * as React from 'react'

import {Box, TextField, Typography} from '@material-ui/core'
// import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete from '@material-ui/lab/Autocomplete'

import UserLabel from '../user/label'
import matchSorter from 'match-sorter'

import SearchDialog from '../search/dialog'
import KeyImportDialog from '../import'

import {keys} from '../../rpc/keys'
import {RPCError, Key, KeysRequest, KeysResponse} from '../../rpc/keys.d'

export type Props = {
  keys: Key[]
  onChange: (value: Key[]) => void
  disabled?: boolean
  placeholder?: string
  searchOption?: boolean
  importOption?: boolean
}

const createOptions = (options: Key[], searchOption: boolean, importOption: boolean): Key[] => {
  if (searchOption) {
    options = options.filter((k: Key) => k.id != 'search')
    options.push({id: 'search'})
  }
  if (importOption) {
    options = options.filter((k: Key) => k.id != 'import')
    options.push({id: 'import'})
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
      <UserLabel kid={option.id} user={option.user} />
    </React.Fragment>
  )
}

const optionSelected = (option: Key, value: Key): boolean => {
  return option.id === value.id
}

const getOptionLabel = (option: Key): string => {
  if (option.id == 'search' || option.id == 'import') {
    return ''
  }
  return ((<UserLabel kid={option.id} user={option.user} />) as unknown) as string
}

export default (props: Props) => {
  const filterOptions = (options, {inputValue}) => {
    const filter = matchSorter(options, inputValue, {keys: ['user.id', 'id']})
    return createOptions(filter, props.searchOption, props.importOption)
  }

  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [options, setOptions] = React.useState([] as Key[])
  const [openSearch, setOpenSearch] = React.useState(false)
  const [openImport, setOpenImport] = React.useState(false)

  const openAutoComplete = () => {
    setOpen(true)
  }

  const onInputChange = React.useCallback((e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    const q = target.value || ''
    setInput(q)
  }, [])

  const search = (q: string) => {
    const req: KeysRequest = {query: q}
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        // TODO: Set error
        return
      }

      const keys = createOptions(resp.keys, props.searchOption, props.importOption)
      setOptions(keys || [])
    })
  }

  React.useEffect(() => {
    search(input)
  }, [input])

  const onChange = (event: React.ChangeEvent<{}>, value: any) => {
    let keys = value as Key[]

    keys.forEach((k: Key) => {
      if (k.id == 'search') {
        setOpenSearch(true)
      }
      if (k.id == 'import') {
        setOpenImport(true)
      }
    })

    keys = keys.filter((k: Key) => k.id != 'search' && k.id != 'import')
    props.onChange(keys)
  }

  return (
    <Box style={{width: '100%'}}>
      <Autocomplete
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
      <SearchDialog open={openSearch} close={() => setOpenSearch(false)} />
      <KeyImportDialog open={openImport} close={() => setOpenImport(false)} />
    </Box>
  )
}
