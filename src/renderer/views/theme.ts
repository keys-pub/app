import {createMuiTheme} from '@material-ui/core/styles'
import {fade, lighten} from '@material-ui/core/styles/colorManipulator'
import {CSSProperties} from 'react'

export const primary = '#2196f3'
export const secondary = '#f44336' // '#f50057' // '#9c27b0' // '#607d8b'

const font = 'Open Sans'
const monoFont = 'Roboto Mono'

export const mono: CSSProperties = {
  fontFamily: monoFont,
  whiteSpace: 'pre-wrap',
  fontSize: '0.8rem',
}

export const theme = createMuiTheme({
  typography: {
    fontFamily: font,
    fontSize: 12,
    body2: {
      fontFamily: monoFont,
      whiteSpace: 'pre-wrap',
      fontSize: '0.81rem',
    },
  },
  palette: {
    primary: {
      main: primary,
    },
    secondary: {
      main: secondary,
    },
  },
  overrides: {
    MuiInput: {
      root: {},
      underline: {
        '&:after': {
          borderBottomColor: `#2196f3`,
          // borderBottomWidth: 1,
        },
        // '&:hover:not($disabled):not($focused):not($error):before': {
        //   borderBottomColor: `black`,
        //   borderBottomWidth: 1,
        // },
      },
    },
    MuiButton: {
      root: {
        fontSize: 14,
      },
      sizeSmall: {
        fontSize: 12,
      },
      sizeLarge: {
        fontSize: 16,
      },
      startIcon: {
        marginRight: 4,
      },
      outlinedPrimary: {
        'not($disabled)': {
          backgroundColor: fade('#2196f3', 0.05),
        },
      },
      outlinedSecondary: {
        'not($disabled)': {
          backgroundColor: fade('#f50057', 0.05),
        },
      },
    },
    MuiTableRow: {
      root: {
        '&$selected': {
          backgroundColor: lighten(primary, 0.95),
        },
        '&$selected, &$selected:hover': {
          backgroundColor: lighten(primary, 0.9),
        },
      },
      hover: {
        '&:hover': {
          backgroundColor: '#eaeaea',
        },
      },
    },
    MuiTabs: {
      root: {
        minHeight: 40,
      },
    },
    MuiTab: {
      root: {
        minHeight: 40,
      },
    },
    // MuiToggleButton: {
    //   root: {
    //     fontFamily: 'Roboto',
    //     fontSize: 14,
    //     backgroundColor: fade('#2196f3', 0.1),
    //   },
    //   sizeSmall: {
    //     fontSize: 12,
    //   },
    //   sizeLarge: {
    //     fontSize: 16,
    //   },
    // },
  },
})

export const breakWords: CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  wordBreak: 'break-all',
}

// TODO: Remove regular
export const regular: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.87)',
  fontSize: '0.857rem',
  fontFamily: font,
  fontWeight: 400,
}

// TODO: Remove body1
export const body1: CSSProperties = {
  fontFamily: font,
  fontWeight: 400,
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
