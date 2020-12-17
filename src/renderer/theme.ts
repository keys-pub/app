import {createMuiTheme} from '@material-ui/core/styles'
import {fade, lighten} from '@material-ui/core/styles/colorManipulator'
import {CSSProperties} from 'react'

export const primary = '#2196f3'
export const secondary = '#f44336' // '#f50057' // '#9c27b0' // '#607d8b'

export const column1Color = '#F5F5F5'
export const column2Color = '#FAFAFA'

const font = 'Open Sans'
const monoFont = 'Roboto Mono'

export const contentTop = 16

export const mono: CSSProperties = {
  fontFamily: monoFont,
  whiteSpace: 'pre-wrap',
  fontSize: '0.8571428571428571rem',
  fontWeight: 400,
}

export const theme = createMuiTheme({
  typography: {
    fontFamily: font,
    fontSize: 12,
    body2: {
      fontFamily: monoFont,
      whiteSpace: 'pre-wrap',
      fontSize: '0.8571428571428571rem',
      lineHeight: '1.5',
    },
    h1: {
      fontSize: 26,
      lineHeight: 'normal',
      fontWeight: 300,
    },
    h2: {
      fontSize: 22,
      lineHeight: 'normal',
      fontWeight: 300,
    },
    h3: {
      fontSize: 19,
      lineHeight: 'normal',
      fontWeight: 300,
    },
    h4: {
      fontSize: 18,
      lineHeight: 'normal',
      fontWeight: 300,
    },
    h5: {
      fontSize: 17,
      lineHeight: 'normal',
      fontWeight: 300,
    },
    h6: {
      fontSize: 16,
      lineHeight: 'normal',
      fontWeight: 300,
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
          borderBottomColor: primary,
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
    },
    MuiTableRow: {
      root: {
        '&$selected': {
          backgroundColor: lighten(primary, 0.8),
        },
        '&$selected, &$selected:hover': {
          backgroundColor: lighten(primary, 0.75),
        },
      },
      hover: {
        '&:hover': {
          backgroundColor: '#eaeaea',
        },
      },
    },
    MuiTableCell: {
      body: {
        borderBottom: 'none',
        verticalAlign: 'top',
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

export const serviceColor = (service?: string): string => {
  if (!service) return ''
  switch (service) {
    case 'github':
      return colors.github
    case 'twitter':
      return colors.twitter
    case 'reddit':
      return colors.reddit
    case 'https':
      return '#669'
    case 'echo':
      return '#699'
    default:
      return '#666'
  }
}
