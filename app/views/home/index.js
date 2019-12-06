// @flow
import React, {Component} from 'react'
import {Box, Typography} from '@material-ui/core'

// TODO: Use this package, pulled from example, so not sure if any good
// import Ionicons from 'react-native-vector-icons/Ionicons'

export default class Home extends Component<{}> {
  static navigationOptions = {
    title: 'Home',
  }

  render() {
    return (
      <Box display="flex" flex={1} justifyContent="center" alignItems="center">
        <Typography>keys.pub</Typography>
      </Box>
    )
  }
}

// Home.navigationOptions = (props: any) => {
//   return {
//     tabBarIcon: ({tintColor, focused}: {tintColor: string, focused: boolean}) => {
//       return (
//         <Ionicons name={focused ? 'ios-home' : 'ios-home-outline'} size={26} style={{color: tintColor}} />
//       )
//     },
//   }
// }
