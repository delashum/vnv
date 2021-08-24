import {addPath, SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'

export interface ArrayConfig {
  minLength: number
  maxLength: number
}

const run = validator<any[], ArrayConfig>('array', {
  minLength: 0,
  maxLength: Infinity
})

export const array = <T>(
  validator: SchemaValidator<T>,
  config: Partial<ArrayConfig & SchemaConfigBase<T[]>> = {}
): SchemaValidator<T[]> =>
  run(
    config,
    (value, config) => {
      if (!Array.isArray(value)) throw new ValidationError('must be an array', value, config)

      if (value.length < config.minLength)
        throw new ValidationError(`must have at least ${config.minLength} element(s)`, value, config)

      if (value.length > config.maxLength)
        throw new ValidationError(`can have at most ${config.maxLength} element(s)`, value, config)

      return value.map((val, i) => addPath(i, () => validator(val)))
    },
    (c, w) => {
      return w(validator.toString() + '[]')
    },
    (c, p, w) => {
      const vObject = validator.toJSONSchema({parentType: 'array'})
      let schema = {
        output: {
          type: 'array',
          items: vObject.output
        },
        meta: {
          required: !c?.optional ?? true
        }
      }
      if (c?.minLength !== 0 || c?.maxLength !== Infinity)
        schema.output = {...schema.output, ...{minLength: c?.minLength}}
      if (c?.maxLength !== Infinity) schema.output = {...schema.output, ...{maxLength: c?.maxLength}}
      return w(schema, p)
    }
  )
