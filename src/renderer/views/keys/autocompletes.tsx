import * as React from 'react'

import {Box, TextField, Typography} from '@material-ui/core'
import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete from '@material-ui/lab/Autocomplete'

import UserLabel from '../user/label'
import matchSorter from 'match-sorter'

import SearchDialog from '../search/dialog'
import KeyImportDialog from '../import'

import {keys} from '../../rpc/keys'
import {RPCError, Key, KeysRequest, KeysResponse} from '../../rpc/keys.d'
import {styles} from '../../components'

import {createStyles} from '@material-ui/styles'
import {withStyles} from '@material-ui/core/styles'

export type Props = {
  identities?: string[]
  disabled?: boolean
  onChange?: (value: string[]) => void
  placeholder?: string
  addOptions?: boolean
  classes: any
}

type State = {
  defaultValues: string[]
  loading: boolean
  error: string
  open: boolean
  openSearch: boolean
  openImport: boolean
  options: Key[]
  selected: Key[]
}

class AutocompletesView extends React.Component<Props, State> {
  state = {
    defaultValues: this.props.identities || [],
    loading: false,
    error: '',
    open: false,
    openImport: false,
    openSearch: false,
    options: [],
    selected: [],
  }

  componentDidMount() {
    this.search('')
  }

  search = (q: string) => {
    this.setState({loading: true}) // , options: []
    const req: KeysRequest = {query: q}
    keys(req, (err: RPCError, resp: KeysResponse) => {
      if (err) {
        this.setState({error: err.details, loading: false})
        return
      }

      // Set default selected keys.
      if (this.state.defaultValues.length > 0) {
        const selected = resp.keys.filter((k: Key) => {
          return this.state.defaultValues.includes(k.id) || this.state.defaultValues.includes(k.user?.id)
        })
        this.setState({defaultValues: [], selected: selected})
      }

      const keys = this.createOptions(resp.keys)
      this.setState({options: keys || [], loading: false})
    })
  }

  createOptions = (options: Key[]): Key[] => {
    if (this.props.addOptions) {
      options = options.filter((k: Key) => k.id != 'search')
      options.push({id: 'search'})
      options = options.filter((k: Key) => k.id != 'import')
      options.push({id: 'import'})
    }
    return options
  }

  openAutoComplete = () => {
    this.search('')
    this.setState({open: true})
  }

  onInputChange = (event: React.ChangeEvent<{}>, value: string, reason: 'input' | 'reset') => {
    this.search(value)
  }

  onChange = (event: React.ChangeEvent<{}>, value: any) => {
    let keys = value as Key[]

    keys.forEach((k: Key) => {
      if (k.id == 'search') {
        this.openSearch()
      }
      if (k.id == 'import') {
        this.openImport()
      }
    })

    keys = keys.filter((k: Key) => k.id != 'search' && k.id != 'import')

    this.setState({selected: keys})
    const identities = keys.map((k: Key) => {
      return k.user?.id || k.id
    })

    if (!!this.props.onChange) {
      this.props.onChange(identities)
    }
  }

  openSearch = () => {
    this.setState({openSearch: true})
  }

  closeSearch = () => {
    this.setState({openSearch: false})
  }

  openImport = () => {
    this.setState({openImport: true})
  }

  closeImport = () => {
    this.setState({openImport: false})
  }

  renderOption = (option: Key) => {
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

  optionSelected = (option: Key, value: string) => {
    return option.id === value && option.user?.id === value
  }

  getOptionLabel = (option: Key): string => {
    if (option.id == 'search' || option.id == 'import') {
      return ''
    }
    return ((<UserLabel kid={option.id} user={option.user} />) as unknown) as string
  }

  render() {
    const filterOptions = (options, {inputValue}) => {
      const filter = matchSorter(options, inputValue, {keys: ['user.id', 'id']})
      return this.createOptions(filter)
    }

    const {open, loading, options} = this.state
    return (
      <Box style={{width: '100%'}}>
        <Autocomplete
          open={open}
          disabled={this.props.disabled}
          onOpen={this.openAutoComplete}
          onClose={() => {
            this.setState({open: false})
          }}
          multiple
          filterOptions={filterOptions}
          onInputChange={this.onInputChange}
          onChange={this.onChange}
          value={this.state.selected}
          getOptionSelected={this.optionSelected}
          getOptionLabel={this.getOptionLabel}
          options={options}
          ChipProps={{variant: 'outlined', size: 'small', style: {marginLeft: 0, marginRight: 5}}} //  icon: <FaceIcon />,
          renderOption={this.renderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={this.props.placeholder}
              fullWidth
              inputProps={{
                ...params.inputProps,
                style: {fontSize: 13.7143, color: 'black'}, // TODO: Font size
              }}
              InputProps={{
                ...params.InputProps,
                classes: {input: this.props.classes.input},
                style: {...styles.mono, minHeight: 31},
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
        <SearchDialog open={this.state.openSearch} close={this.closeSearch} />
        <KeyImportDialog open={this.state.openImport} close={this.closeImport} />
      </Box>
    )
  }
}

const cstyles = (theme: any) =>
  createStyles({
    input: {
      '&::placeholder': {
        fontFamily: 'Open Sans',
      },
    },
  })

export default withStyles(cstyles)(AutocompletesView)
