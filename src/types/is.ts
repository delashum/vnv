import {SchemaConfigBase, setIdValue, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'

export interface IsConfig {
  id?: string
}

const run = validator<any, IsConfig>('is', {})

export const is = <T extends string | number | boolean | symbol | null>(
  value: T | T[],
  config: Partial<IsConfig & SchemaConfigBase<any>> = {}
): SchemaValidator<T> => {
  const values = Array.isArray(value) ? value : [value]
  return run(
    config,
    (_value, config) => {
      if (config.id) setIdValue(config.id, _value)
      if (!values.includes(_value))
        throw new ValidationError(
          Array.isArray(value) ? `must be either ${value.join(' | ')}}` : `must be exactly ${value}}`,
          _value,
          config
        )
      return _value
    },
    () => JSON.stringify(value),
    (c, p, w) => {
      const schema = {
        output: {
          enum: values
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      return w(schema, {...p, ...config})
    }
  )
}
