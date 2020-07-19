import purple from '@material-ui/core/colors/purple'

import {CSSProperties} from 'react'

import {fade} from '@material-ui/core/styles/colorManipulator'

type Colors = {
  github: string
  twitter: string
  reddit: string
}

const logo = {
  fontSize: 64,
  fontFamily: 'Futura',
  fontWeight: 600,
  textShadow: '-0.04em 0 #f50057, 0.06em 0 #2196f3',
  // letterSpacing: '0.07em',
  color: 'white',
} // fontFamily: 'Sans Forgetica',

const mono = {
  fontFamily: 'Roboto Mono',
  whiteSpace: 'pre-wrap',
  fontSize: 13,
}

const breakWords = {
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  wordBreak: 'break-all',
}

const messageInput = {
  color: 'rgba(0, 0, 0, 0.87)',
  fontSize: '0.875rem',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: '0.01071em',
}

export type AppStyles = {
  colors: Colors
  messageInput: CSSProperties
  logo: CSSProperties
  mono: any
  breakWords: any
}

export const colors: Colors = {
  github: 'purple', // rgb(68,68,68)'
  twitter: 'rgb(76,160,235)',
  reddit: '#FF5700',
}

// type CellStyles = {
//   user: CSSProperties
//   owner: CSSProperties
// }

// export const cells: CellStyles = {
//   user: {
//     // backgroundColor: '#efefef',
//     // border: '0.5px solid #afafaf',
//     boxShadow: '0 0 0 0.5px #afafaf',
//     borderRadius: 3,
//     paddingLeft: 4,
//     paddingRight: 4,
//     paddingTop: 2,
//     paddingBottom: 4,
//     marginRight: 6,
//     marginTop: 1,
//     marginBottom: -1,
//   },
//   owner: {
//     boxShadow: '0 0 0 0.5px #9f9f9f',
//     borderRadius: 3,
//     paddingLeft: 4,
//     paddingRight: 4,
//     paddingTop: 2,
//     paddingBottom: 4,
//     marginRight: 6,
//     marginTop: 1,
//     marginBottom: 2,
//     color: 'green',
//   },
// }

const styles: AppStyles = {
  colors,
  messageInput,
  logo,
  mono,
  // cells,
  breakWords,
}

export const serviceColor = (service: string): string => {
  switch (service) {
    case 'github':
      return colors.github
    case 'twitter':
      return colors.twitter
    case 'reddit':
      return colors.reddit
    case 'https':
      return '#669'
    default:
      return '#666'
  }
}

export const backgroundSelectedColor = () => {
  return '#eaeaea' // fade('#2196f3', 0.075)
}

export default styles
