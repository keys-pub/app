import {createMuiTheme} from '@material-ui/core/styles'
import {fade, lighten} from '@material-ui/core/styles/colorManipulator'

import CheckBoxOutlineBlankSharpIcon from '@material-ui/icons/CheckBoxOutlineBlankSharp'

const primary = '#2196f3'
const secondary = '#f50057'

export const theme = createMuiTheme({
  typography: {
    // fontFamily: 'Roboto',
    fontFamily: 'Open Sans',
    fontSize: 12,
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
      root: {
        // fontFamily: 'Roboto Mono',
      },
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
        // fontFamily: 'Roboto',
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
