import * as React from 'react'

import {Box, TextField, TextFieldProps, Typography} from '@material-ui/core'

import Autocomplete from '@material-ui/lab/Autocomplete'

import {KeyLabel} from '../key/label'
import matchSorter, {rankings} from 'match-sorter'

import SearchDialog from '../search/dialog'
import KeyImportDialog from '../import'

import {keys} from '../rpc/client'
import {Key, KeysRequest, KeysResponse, SortDirection} from '@keys-pub/tsclient/lib/keys.d'
import {openSnackError} from '../snack'

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
      <KeyLabel k={option} />
    </React.Fragment>
  )
}

const optionSelected = (option: Key, value: Key): boolean => {
  return option.id == value.id
}

const getOptionLabel = (option: Key): string => {
  if (option.id == 'search' || option.id == 'import') {
    return ''
  }
  return ((<KeyLabel k={option} />) as unknown) as string
}

export default (props: Props) => {
  const filterOptions = (options: Key[], {inputValue}: {inputValue: string}) => {
    const filter = matchSorter(options, inputValue, {
      keys: [
        {threshold: rankings.STARTS_WITH, key: 'user.id'},
        {threshold: rankings.STARTS_WITH, key: 'id'},
      ],
    })
    return createOptions(filter, !!props.searchOption, !!props.importOption)
  }

  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState(props.keys)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)

  React.useEffect(() => {
    search()
  }, [])

  const openAutoComplete = () => {
    setOpen(true)
  }

  const search = async () => {
    try {
      // Filtering happens with matchSorter.
      const resp = await keys.Keys({})
      const results = createOptions(resp.keys || [], !!props.searchOption, !!props.importOption)
      setOptions(results || [])
    } catch (err) {
      openSnackError(err)
    }
  }

  const closeImport = () => {
    setImportOpen(false)
    search()
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
        filterSelectedOptions
        filterOptions={filterOptions}
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
      <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} reload={search} />
      <KeyImportDialog open={importOpen} close={closeImport} />
    </Box>
  )
}
