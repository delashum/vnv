import {getSession} from './base'

export class ValidationError extends Error {
  path: string[]
  rawMessage: string
  value: any
  config: any
  fn: string
  constructor(err: ValidationError)
  constructor(message: string, value: any, config: any)
  constructor(message: string | ValidationError, value?: any, config?: any) {
    super()
    if (message instanceof ValidationError) {
      this.path = message.path
      this.rawMessage = message.rawMessage
      this.value = message.value
      this.config = message.config
      this.name = message.name
      this.fn = message.fn
    } else {
      const {path, name} = getSession()
      this.rawMessage = message
      this.path = path
      this.value = value
      this.config = config
      this.fn = name
      this.name = `ValidationError ${this.fn}()`
    }
    this.message = `${this.path.join('.')} ${this.rawMessage}`.trim()
  }
}

export class CustomValidationError extends Error {
  constructor(message: string) {
    super()
    this.message = message
  }
}
