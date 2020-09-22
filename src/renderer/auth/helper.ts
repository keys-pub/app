import {AuthType} from '../rpc/keys.d'

export const authTypeDescription = (t?: AuthType, titleCase?: boolean) => {
  switch (t) {
    case AuthType.PASSWORD_AUTH:
      return titleCase ? 'Password' : 'password'
    case AuthType.PAPER_KEY_AUTH:
      return titleCase ? 'Paper Key' : 'paper key'
    case AuthType.FIDO2_HMAC_SECRET_AUTH:
      return 'FIDO2 HMAC-Secret'
    default:
      return titleCase ? 'Unknown (' + t + ')' : 'unknown (' + t + ')'
  }
}
