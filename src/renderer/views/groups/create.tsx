import * as React from 'react'

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography,
} from '@material-ui/core'

import {Step} from '../../components'

import {connect} from 'react-redux'
import {goBack} from 'connected-react-router'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  name: string
  loading: boolean
  error: string
}

class GroupCreateView extends React.Component<Props, State> {
  state = {
    name: '',
    loading: false,
    error: '',
  }

  create = () => {
    /*
    const req: GroupCreateRequest = {name: this.state.name, key: '', passphrase: ''}
    this.setState({loading: true})
    this.props.dispatch(
      groupCreate(
        req,
        (resp: GroupCreateResponse) => {
          this.setState({loading: false})
          this.props.dispatch(goBack())
        },
        (err: Error) => {
          this.setState({error: err.details})
        }
      )
    )
    */
  }

  render() {
    const {loading} = this.state
    return (
      <Step
        title="Create a Group"
        next={{label: 'Create', action: this.create}}
        prev={{label: 'Cancel', action: () => this.props.dispatch(goBack())}}
      >
        <Box style={{marginBottom: 20}}>
          <Typography variant="subtitle1" style={{paddingBottom: 20}}>
            What's this group about? The group name is secret and only visible to those in the group.
          </Typography>
          <FormControl>
            <Input
              autoFocus={true}
              placeholder={'Group Name'}
              onChange={(e: React.SyntheticEvent<EventTarget>) =>
                this.setState({
                  name: (e.target as HTMLInputElement).value,
                })
              }
            />
            <FormHelperText>{this.state.error}</FormHelperText>
          </FormControl>
        </Box>
      </Step>
    )
  }
}

export default connect()(GroupCreateView)
