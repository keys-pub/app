import * as React from 'react'

type Props = {
  children: any
}

export default class App extends React.Component<Props> {
  render() {
    return <div style={{display: 'flex', flex: 1, height: '100%'}}>{this.props.children}</div>
  }
}
