import * as React from 'react'

import {
  Box,
  Button,
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core'
import {styles, Step} from '../components'

import {push, goBack} from 'connected-react-router'

import {connect} from 'react-redux'

type Props = {
  dispatch: (action: any) => any
}

type State = {
  key: string
  error: string
}

class GroupJoinView extends React.Component<Props, State> {
  state = {
    key: '',
    error: null,
  }

  join = () => {
    /*
    const req: GroupJoinRequest = {key: this.state.key}
    this.props.dispatch(
      groupJoin(
        req,
        (resp: GroupJoinResponse) => {
          if (!resp.group) {
            this.setState({error: 'No group found with that passphrase'})
            return
          }
          this.props.dispatch(push('/identity/name', {address: resp.group.id}))
        },
        (err: Error) => {
          this.setState({error: err.message})
        }
      )
    )
    */
  }

  render() {
    return (
      <Step
        title="Join a Group"
        next={{label: 'Join', action: this.join}}
        prev={{label: 'Cancel', action: () => this.props.dispatch(goBack())}}
      >
        <FormControl error={!!this.state.error}>
          <Input
            placeholder="Key or passphrase"
            multiline={true}
            rows={10}
            autoFocus
            value={this.state.key}
            onChange={(e: React.SyntheticEvent<EventTarget>) =>
              this.setState({error: null, key: (e.target as HTMLInputElement).value})
            }
            onFocus={(e: React.SyntheticEvent<EventTarget>) => this.setState({error: null})}
          />
          <FormHelperText>{this.state.error}</FormHelperText>
        </FormControl>
      </Step>
    )
  }
}

export default connect()(GroupJoinView)
