import purple from '@material-ui/core/colors/purple'

import {CSSProperties} from 'react'

import {fade} from '@material-ui/core/styles/colorManipulator'

export const logo: CSSProperties = {
  fontSize: 64,
  fontFamily: 'Futura',
  fontWeight: 600,
  textShadow: '-0.04em 0 #f50057, 0.06em 0 #2196f3',
  // letterSpacing: '0.07em',
  color: 'white',
} // fontFamily: 'Sans Forgetica',

export const mono: CSSProperties = {
  fontFamily: 'Roboto Mono',
  whiteSpace: 'pre-wrap',
  fontSize: 13,
}

export const regular: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.87)',
  fontSize: '0.857rem',
  fontFamily: 'Open Sans',
  fontWeight: 400,
}

export const breakWords: CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  wordBreak: 'break-all',
}

export const colors = {
  github: 'purple', // rgb(68,68,68)'
  twitter: 'rgb(76,160,235)',
  reddit: '#FF5700',
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

const styles = {
  mono,
  regular,
  breakWords,
}

export default styles
