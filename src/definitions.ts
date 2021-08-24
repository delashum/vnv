import {vnvMethodName, vnvValidatorSymbol} from './symbols'
import {JSONSchemaProperties} from './base'

export type SchemaValidator<T = any> = {
  (value: any): ValidationResults<T>
  stringify: () => string
  toJSONSchema: (properties?:JSONSchemaProperties) => any // Returns JSON Schema
  [vnvValidatorSymbol]: boolean
  [vnvMethodName]: string
}

export type ValidationResults<T = any> = T
