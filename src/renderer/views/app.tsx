import {hot} from 'react-hot-loader/root'
import * as React from 'react'

type Props = {
  children: any
}

class App extends React.Component<Props> {
  render() {
    return <div style={{display: 'flex', flex: 1, height: '100%'}}>{this.props.children}</div>
  }
}

export default hot(App)
