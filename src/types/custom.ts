import {finaltransformer, JSONSchemaProperties, SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {CustomValidationError, ValidationError} from '../errors'

export interface CustomerConfig {
  toString: () => string
}

const run = validator<any, CustomerConfig>('any', {toString: () => 'custom'})

export const custom = <T>(
  validator: (value: T) => T,
  config: Partial<CustomerConfig & SchemaConfigBase<any>> = {},
  customJSONSchema: (c: any, p: JSONSchemaProperties, w: typeof finaltransformer) => object // return a custom JSON schema object, JSON Schema draft-04 valid
): SchemaValidator<T> =>
  run(
    config,
    (value, config) => {
      try {
        return validator(value)
      } catch (err) {
        if (err instanceof CustomValidationError) {
          throw new ValidationError(err.message, value, config)
        } else throw err
      }
    },
    (_config) => _config.toString(),
    (c, p, w) => {
      const schema = {
        output: customJSONSchema(c, p, w),
        meta: {
          required: c?.optional ?? false
        }
      }

      return w(schema, p)
    }
  )
