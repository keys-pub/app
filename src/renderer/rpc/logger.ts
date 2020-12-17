import {Logger} from 'ts-log'

export class ConsoleLogger implements Logger {
  public constructor() {}

  public trace(message?: any, ...optionalParams: any[]): void {
    // console.log(`${message} ${JSON.stringify(optionalParams)}`)
  }

  public debug(message?: any, ...optionalParams: any[]): void {
    let out = '[RPC] ' + message
    if (optionalParams.length > 0) {
      out += ' ' + JSON.stringify(optionalParams)
    }
    console.log(out)
  }

  public info(message?: any, ...optionalParams: any[]): void {
    let out = '[RPC] ' + message
    if (optionalParams.length > 0) {
      out += ' ' + JSON.stringify(optionalParams)
    }
    console.log(out)
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    let out = '[RPC] ' + message
    if (optionalParams.length > 0) {
      out += ' ' + JSON.stringify(optionalParams)
    }
    console.warn(out)
  }

  public error(message?: any, ...optionalParams: any[]): void {
    let out = '[RPC] ' + message
    if (optionalParams.length > 0) {
      out += ' ' + JSON.stringify(optionalParams)
    }
    console.error(out)
  }
}
