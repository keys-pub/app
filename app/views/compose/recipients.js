// @flow
import React, {Component} from 'react'

import {Box, Button, Divider, MenuItem, Paper, Typography} from '@material-ui/core'
import ChipInput from './chip-input'

import Autosuggest from 'react-autosuggest'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {styles} from '../components'

import type {SearchResult} from '../../rpc/types'
// import type {SearchResponse} from '../../rpc/rpc'

export type Props = {
  search: (q: string) => Promise<Array<SearchResult>>,
  select: (results: Array<SearchResult>) => *,
}

type State = {
  results: Array<SearchResult>,
  selected: Array<any>,
  input: string,
}

class Recipients extends Component<Props, State> {
  state = {
    results: [],
    selected: [],
    input: '',
  }

  requestSuggestions = (req: {value: string}) => {
    this.props.search(req.value).then((results: Array<SearchResult>) => {
      this.setState({
        results: results,
      })
    })
  }

  clearSuggestions = () => {
    this.setState({
      results: [],
    })
  }

  onInputChange = (e: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      input: e.target.value,
    })
  }

  add = (result: SearchResult) => {
    const selected = [...this.state.selected, result]
    this.setState({
      selected,
      input: '',
    })
    this.props.select(selected)
  }

  delete = (result: SearchResult, index: number) => {
    let temp = this.state.selected
    temp.splice(index, 1)
    this.setState({selected: temp})
  }

  render() {
    return (
      <Autosuggest
        renderInputComponent={renderInput}
        suggestions={this.state.results}
        onSuggestionsFetchRequested={this.requestSuggestions}
        onSuggestionsClearRequested={this.clearSuggestions}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={(e, value: {suggestion: SearchResult}) => {
          this.add(value.suggestion)
          // e.preventDefault()
        }}
        theme={autosuggest}
        focusInputOnSuggestionClick
        inputProps={{
          selected: this.state.selected,
          onChange: this.onInputChange,
          value: this.state.input,
          onAdd: this.add,
          onDelete: this.delete,
        }}
      />
    )
  }
}

const autosuggest = {
  root: {
    height: 250,
    flexGrow: 1,
  },
  container: {
    position: 'relative',
    marginTop: 4,
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
}

const renderInput = inputProps => {
  const {autoFocus, value, onChange, onAdd, onDelete, selected, ref, ...other} = inputProps

  const names = selected.map((result: SearchResult) => {
    if (result.users && result.users.length > 0) {
      const user = result.users[0]
      return user.name + '@' + user.service
    } else {
      return result.kid
    }
  })

  return (
    <Box display="flex" flexDirection="row" flex={1} style={{paddingLeft: 10}}>
      <Box style={{paddingRight: 10, paddingTop: 8}}>
        <Typography variant="body1">To</Typography>
      </Box>
      <Box display="flex" flexDirection="row" flex={1} style={{paddingTop: 2}}>
        <ChipInput
          clearInputValueOnChange
          onUpdateInput={onChange}
          onAdd={onAdd}
          onDelete={onDelete}
          value={names}
          inputRef={ref}
          {...other}
        />
      </Box>
    </Box>
  )
}

const renderSuggestion = (result: SearchResult, opts: {query: string, isHighlighted: boolean}) => {
  // return (
  //   <Row value={result.key || {kid: '', users: [], type: 'PUBLIC_KEY_TYPE'}} selected={opts.isHighlighted} />
  // )
  return null
}

const renderSuggestionsContainer = options => {
  const {containerProps, children} = options

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  )
}

const getSuggestionValue = (result: SearchResult) => {
  return result.kid || ''
}

export default Recipients
